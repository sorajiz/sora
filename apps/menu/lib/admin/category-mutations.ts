import { withTransaction, query } from "../db";
import { Actor, MenuCategory } from "../types";
import { requirePermission, PERMISSIONS } from "../auth/rbac";
import { generateTraceId } from "../domain/reference";
import { sanitizeBrandText, slugifyVietnamese } from "../domain/text";

export async function createCategoryMutation(
  actor: Actor,
  input: { name: string; emoji?: string; description?: string }
): Promise<MenuCategory> {
  requirePermission(actor, PERMISSIONS.CATEGORY_MANAGE);

  const cleanName = sanitizeBrandText(input.name);
  const slug = slugifyVietnamese(cleanName);
  const traceId = generateTraceId();

  return await withTransaction(
    async (client) => {
      const res = await client.query<MenuCategory>(
        `INSERT INTO menu_categories (slug, name, emoji, description, sort_order, status)
         VALUES ($1, $2, $3, $4, 0, 'ACTIVE')
         RETURNING *;`,
        [slug, cleanName, input.emoji || null, sanitizeBrandText(input.description)]
      );

      const cat = res.rows[0];

      // Audit log
      await client.query(
        `INSERT INTO menu_audit_logs (actor_type, actor_id, source, action, category_id, before_json, after_json, menu_version, operation_id)
         VALUES ($1, $2, 'WEBSITE', 'CREATE_CATEGORY', $3, NULL, $4, 0, $5);`,
        [actor.role, actor.discordId, cat.id, JSON.stringify(cat), traceId]
      );

      return cat;
    },
    { actorId: actor.discordId, source: "WEBSITE", traceId }
  );
}

export async function updateCategoryMutation(
  actor: Actor,
  categoryId: string,
  input: { name?: string; emoji?: string; description?: string; sort_order?: number }
): Promise<MenuCategory> {
  requirePermission(actor, PERMISSIONS.CATEGORY_MANAGE);
  const traceId = generateTraceId();

  return await withTransaction(
    async (client) => {
      const currentRows = await client.query<MenuCategory>(
        `SELECT * FROM menu_categories WHERE id = $1 FOR UPDATE;`,
        [categoryId]
      );
      if (currentRows.rows.length === 0) throw new Error("Category not found");
      const current = currentRows.rows[0];

      const res = await client.query<MenuCategory>(
        `UPDATE menu_categories SET
           name = COALESCE($1, name),
           emoji = COALESCE($2, emoji),
           description = COALESCE($3, description),
           sort_order = COALESCE($4, sort_order),
           updated_at = NOW()
         WHERE id = $5
         RETURNING *;`,
        [
          input.name ? sanitizeBrandText(input.name) : null,
          input.emoji !== undefined ? input.emoji : null,
          input.description ? sanitizeBrandText(input.description) : null,
          input.sort_order !== undefined ? input.sort_order : null,
          categoryId,
        ]
      );

      const updated = res.rows[0];
      await client.query(
        `INSERT INTO menu_audit_logs (actor_type, actor_id, source, action, category_id, before_json, after_json, menu_version, operation_id)
         VALUES ($1, $2, 'WEBSITE', 'UPDATE_CATEGORY', $3, $4, $5, 0, $6);`,
        [actor.role, actor.discordId, categoryId, JSON.stringify(current), JSON.stringify(updated), traceId]
      );

      return updated;
    },
    { actorId: actor.discordId, source: "WEBSITE", traceId }
  );
}

export async function archiveCategoryMutation(
  actor: Actor,
  categoryId: string
): Promise<void> {
  requirePermission(actor, PERMISSIONS.CATEGORY_MANAGE);

  // Check active products (§8: blocked while ACTIVE products remain)
  const countRows = await query<{ count: string }>(
    `SELECT count(*) as count FROM menu_products WHERE category_id = $1 AND status = 'ACTIVE' AND deleted_at IS NULL;`,
    [categoryId]
  );
  const activeCount = parseInt(countRows[0]?.count || "0", 10);
  if (activeCount > 0) {
    throw new Error(`Cannot archive category: ${activeCount} active product(s) remain in this category.`);
  }

  const traceId = generateTraceId();
  await withTransaction(
    async (client) => {
      await client.query(`UPDATE menu_categories SET status = 'ARCHIVED', updated_at = NOW() WHERE id = $1;`, [categoryId]);
      await client.query(
        `INSERT INTO menu_audit_logs (actor_type, actor_id, source, action, category_id, before_json, after_json, menu_version, operation_id)
         VALUES ($1, $2, 'WEBSITE', 'ARCHIVE_CATEGORY', $3, NULL, NULL, 0, $4);`,
        [actor.role, actor.discordId, categoryId, traceId]
      );
    },
    { actorId: actor.discordId, source: "WEBSITE", traceId }
  );
}
