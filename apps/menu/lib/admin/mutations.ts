import { withTransaction, query } from "../db";
import { Actor, MenuProduct, MenuCategory, MenuSettings } from "../types";
import { requirePermission, PERMISSIONS } from "../auth/rbac";
import { generateTraceId } from "../domain/reference";
import { sanitizeBrandText, slugifyVietnamese, isValidSku } from "../domain/text";

export class OptimisticConcurrencyError extends Error {
  public readonly code = "CONFLICT";
  public readonly currentProduct: MenuProduct;
  constructor(message: string, currentProduct: MenuProduct) {
    super(message);
    this.name = "OptimisticConcurrencyError";
    this.currentProduct = currentProduct;
  }
}

/**
 * Computes a hash of the public-visible projection to check if public_version should increment (§S7)
 */
function hashPublicProjection(product: {
  status: string;
  name: string;
  price_amount: string | number;
  category_id: string | null;
  short_description: string | null;
  is_available: boolean;
}): string {
  return `${product.status}:${product.name}:${product.price_amount}:${product.category_id}:${product.is_available}:${product.short_description || ""}`;
}

export async function createProductMutation(
  actor: Actor,
  input: {
    sku: string;
    name: string;
    short_description?: string;
    description?: string;
    category_id?: string | null;
    price_amount: number | string;
    compare_at_price?: number | string | null;
    stock_mode?: "UNLIMITED" | "TRACKED" | "MANUAL";
    stock_quantity?: number;
    status?: "DRAFT" | "ACTIVE" | "SOLD_OUT" | "HIDDEN";
    is_featured?: boolean;
    is_available?: boolean;
    sort_order?: number;
    discord_select_label?: string;
    discord_select_description?: string;
    discord_select_emoji_name?: string;
    discord_select_emoji_id?: string;
    discord_select_emoji_animated?: boolean;
  }
): Promise<MenuProduct> {
  requirePermission(actor, PERMISSIONS.PRODUCT_CREATE);

  const cleanSku = input.sku.trim().toUpperCase();
  if (!isValidSku(cleanSku)) {
    throw new Error("Invalid SKU format. Must match ^[A-Z0-9][A-Z0-9-]{1,31}$");
  }

  const cleanName = sanitizeBrandText(input.name);
  const slug = slugifyVietnamese(cleanName);
  const traceId = generateTraceId();

  return await withTransaction(
    async (client) => {
      // 1. Insert product
      const res = await client.query<MenuProduct>(
        `INSERT INTO menu_products (
          sku, slug, name, short_description, description, category_id,
          price_amount, currency, compare_at_price, stock_mode, stock_quantity,
          status, is_featured, is_available, sort_order,
          discord_select_label, discord_select_description,
          discord_select_emoji_name, discord_select_emoji_id, discord_select_emoji_animated,
          version, created_by, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, 'VND', $8, $9, $10,
          $11, $12, $13, $14,
          $15, $16,
          $17, $18, $19,
          1, $20, $20
        ) RETURNING *;`,
        [
          cleanSku,
          slug,
          cleanName,
          sanitizeBrandText(input.short_description),
          sanitizeBrandText(input.description),
          input.category_id || null,
          BigInt(input.price_amount || 0).toString(),
          input.compare_at_price ? BigInt(input.compare_at_price).toString() : null,
          input.stock_mode || "UNLIMITED",
          input.stock_quantity || 0,
          input.status || "ACTIVE",
          Boolean(input.is_featured),
          input.is_available !== false,
          input.sort_order || 0,
          input.discord_select_label ? sanitizeBrandText(input.discord_select_label) : cleanName,
          input.discord_select_description ? sanitizeBrandText(input.discord_select_description) : null,
          input.discord_select_emoji_name || null,
          input.discord_select_emoji_id || null,
          Boolean(input.discord_select_emoji_animated),
          actor.discordId,
        ]
      );

      const product = res.rows[0];

      // 2. Increment global version
      const stateRes = await client.query<{ current_version: string }>(
        `UPDATE menu_state SET current_version = current_version + 1, updated_at = NOW(), updated_by = $1 RETURNING current_version;`,
        [actor.discordId]
      );
      const newVersion = Number(stateRes.rows[0]?.current_version || 1);

      // 3. Write audit log
      await client.query(
        `INSERT INTO menu_audit_logs (
          actor_type, actor_id, source, action, product_id, before_json, after_json, menu_version, operation_id
        ) VALUES ($1, $2, 'WEBSITE', 'CREATE_PRODUCT', $3, NULL, $4, $5, $6);`,
        [actor.role, actor.discordId, product.id, JSON.stringify(product), newVersion, traceId]
      );

      // 4. Write outbox event + delivery rows
      const eventRes = await client.query<{ id: string }>(
        `INSERT INTO menu_outbox_events (
          event_type, aggregate_type, aggregate_id, menu_version, payload, status
        ) VALUES ('MENU_PRODUCT_CREATED', 'PRODUCT', $1, $2, $3, 'PENDING') RETURNING id;`,
        [
          product.id,
          newVersion,
          JSON.stringify({
            event_id: traceId,
            type: "MENU_PRODUCT_CREATED",
            schema: "pade.menu.v2",
            aggregate_id: product.id,
            public_version: newVersion,
            occurred_at: new Date().toISOString(),
            trace_id: traceId,
          }),
        ]
      );

      const eventId = eventRes.rows[0].id;
      await client.query(
        `INSERT INTO menu_outbox_deliveries (event_id, consumer_name, status)
         VALUES ($1, 'discord_publisher', 'PENDING'),
                ($1, 'website_revalidate', 'PENDING');`,
        [eventId]
      );

      return product;
    },
    { actorId: actor.discordId, source: "WEBSITE", traceId }
  );
}

export async function updateProductMutation(
  actor: Actor,
  productId: string,
  input: {
    sku?: string;
    name?: string;
    short_description?: string;
    description?: string;
    category_id?: string | null;
    price_amount?: number | string;
    compare_at_price?: number | string | null;
    stock_mode?: "UNLIMITED" | "TRACKED" | "MANUAL";
    stock_quantity?: number;
    status?: "DRAFT" | "ACTIVE" | "SOLD_OUT" | "HIDDEN" | "ARCHIVED";
    is_featured?: boolean;
    is_available?: boolean;
    sort_order?: number;
    discord_select_label?: string;
    discord_select_description?: string;
    discord_select_emoji_name?: string;
    discord_select_emoji_id?: string;
    discord_select_emoji_animated?: boolean;
  },
  expectedVersion: number
): Promise<MenuProduct> {
  requirePermission(actor, PERMISSIONS.PRODUCT_EDIT);
  const traceId = generateTraceId();

  return await withTransaction(
    async (client) => {
      // 1. Fetch current row for optimistic check & diff
      const currentRows = await client.query<MenuProduct>(
        `SELECT * FROM menu_products WHERE id = $1 FOR UPDATE;`,
        [productId]
      );

      if (currentRows.rows.length === 0) {
        throw new Error("Product not found");
      }

      const current = currentRows.rows[0];
      if (Number(current.version) !== Number(expectedVersion)) {
        throw new OptimisticConcurrencyError(
          "This product was updated elsewhere. Load latest version to resolve.",
          current
        );
      }

      const cleanName = input.name ? sanitizeBrandText(input.name) : current.name;
      const cleanSku = input.sku ? input.sku.trim().toUpperCase() : current.sku;

      // 2. Update product
      const res = await client.query<MenuProduct>(
        `UPDATE menu_products SET
          sku = $1,
          name = $2,
          short_description = $3,
          description = $4,
          category_id = $5,
          price_amount = $6,
          compare_at_price = $7,
          stock_mode = $8,
          stock_quantity = $9,
          status = $10,
          is_featured = $11,
          is_available = $12,
          sort_order = $13,
          discord_select_label = $14,
          discord_select_description = $15,
          discord_select_emoji_name = $16,
          discord_select_emoji_id = $17,
          discord_select_emoji_animated = $18,
          version = version + 1,
          updated_by = $19,
          updated_at = NOW()
        WHERE id = $20 AND version = $21
        RETURNING *;`,
        [
          cleanSku,
          cleanName,
          input.short_description !== undefined ? sanitizeBrandText(input.short_description) : current.short_description,
          input.description !== undefined ? sanitizeBrandText(input.description) : current.description,
          input.category_id !== undefined ? input.category_id : current.category_id,
          input.price_amount !== undefined ? BigInt(input.price_amount).toString() : current.price_amount,
          input.compare_at_price !== undefined ? (input.compare_at_price ? BigInt(input.compare_at_price).toString() : null) : current.compare_at_price,
          input.stock_mode || current.stock_mode,
          input.stock_quantity !== undefined ? input.stock_quantity : current.stock_quantity,
          input.status || current.status,
          input.is_featured !== undefined ? Boolean(input.is_featured) : current.is_featured,
          input.is_available !== undefined ? Boolean(input.is_available) : current.is_available,
          input.sort_order !== undefined ? input.sort_order : current.sort_order,
          input.discord_select_label !== undefined ? sanitizeBrandText(input.discord_select_label) : current.discord_select_label,
          input.discord_select_description !== undefined ? sanitizeBrandText(input.discord_select_description) : current.discord_select_description,
          input.discord_select_emoji_name !== undefined ? input.discord_select_emoji_name : current.discord_select_emoji_name,
          input.discord_select_emoji_id !== undefined ? input.discord_select_emoji_id : current.discord_select_emoji_id,
          input.discord_select_emoji_animated !== undefined ? Boolean(input.discord_select_emoji_animated) : current.discord_select_emoji_animated,
          actor.discordId,
          productId,
          expectedVersion,
        ]
      );

      const updated = res.rows[0];

      // 3. Increment menu version if public projection changed (§S7)
      const oldProj = hashPublicProjection(current);
      const newProj = hashPublicProjection(updated);
      let newVersion = 0;

      if (oldProj !== newProj) {
        const stateRes = await client.query<{ current_version: string }>(
          `UPDATE menu_state SET current_version = current_version + 1, updated_at = NOW(), updated_by = $1 RETURNING current_version;`,
          [actor.discordId]
        );
        newVersion = Number(stateRes.rows[0]?.current_version || 1);
      } else {
        const stateRes = await client.query<{ current_version: string }>(
          `SELECT current_version FROM menu_state ORDER BY updated_at DESC LIMIT 1;`
        );
        newVersion = Number(stateRes.rows[0]?.current_version || 1);
      }

      // 4. Audit log
      await client.query(
        `INSERT INTO menu_audit_logs (
          actor_type, actor_id, source, action, product_id, before_json, after_json, menu_version, operation_id
        ) VALUES ($1, $2, 'WEBSITE', 'UPDATE_PRODUCT', $3, $4, $5, $6, $7);`,
        [actor.role, actor.discordId, productId, JSON.stringify(current), JSON.stringify(updated), newVersion, traceId]
      );

      // 5. Outbox
      const eventRes = await client.query<{ id: string }>(
        `INSERT INTO menu_outbox_events (
          event_type, aggregate_type, aggregate_id, menu_version, payload, status
        ) VALUES ('MENU_PRODUCT_UPDATED', 'PRODUCT', $1, $2, $3, 'PENDING') RETURNING id;`,
        [
          productId,
          newVersion,
          JSON.stringify({
            event_id: traceId,
            type: "MENU_PRODUCT_UPDATED",
            schema: "pade.menu.v2",
            aggregate_id: productId,
            public_version: newVersion,
            occurred_at: new Date().toISOString(),
            trace_id: traceId,
          }),
        ]
      );

      const eventId = eventRes.rows[0].id;
      await client.query(
        `INSERT INTO menu_outbox_deliveries (event_id, consumer_name, status)
         VALUES ($1, 'discord_publisher', 'PENDING'),
                ($1, 'website_revalidate', 'PENDING');`,
        [eventId]
      );

      return updated;
    },
    { actorId: actor.discordId, source: "WEBSITE", traceId }
  );
}

export async function archiveProductMutation(
  actor: Actor,
  productId: string,
  expectedVersion: number
): Promise<void> {
  requirePermission(actor, PERMISSIONS.PRODUCT_ARCHIVE);
  await updateProductMutation(actor, productId, { status: "ARCHIVED" }, expectedVersion);
}
