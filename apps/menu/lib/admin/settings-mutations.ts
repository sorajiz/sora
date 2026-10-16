import { withTransaction } from "../db";
import { Actor, MenuSettings } from "../types";
import { requirePermission, PERMISSIONS } from "../auth/rbac";
import { generateTraceId } from "../domain/reference";
import { sanitizeBrandText } from "../domain/text";

function validateUrl(urlStr: string | null | undefined): string | null {
  if (!urlStr) return null;
  const trimmed = urlStr.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") {
      throw new Error(`Insecure or invalid URL: ${trimmed}. Only https: URLs are permitted.`);
    }
    return trimmed;
  } catch {
    throw new Error(`Invalid URL: ${trimmed}. Must be a valid https: URL.`);
  }
}

export async function updateSettingsMutation(
  actor: Actor,
  input: {
    store_name?: string;
    tagline?: string;
    description_template?: string;
    thumbnail_url?: string | null;
    banner_url?: string | null;
    tos_url?: string;
    rules_url?: string;
    support_url?: string;
    sale_url?: string;
    discord_invite_url?: string;
    website_url?: string;
  }
): Promise<MenuSettings> {
  requirePermission(actor, PERMISSIONS.SETTINGS_MANAGE);
  const traceId = generateTraceId();

  return await withTransaction(
    async (client) => {
      const currentRows = await client.query<MenuSettings>(
        `SELECT * FROM menu_settings LIMIT 1 FOR UPDATE;`
      );
      const current = currentRows.rows[0];

      const res = await client.query<MenuSettings>(
        `UPDATE menu_settings SET
           store_name = COALESCE($1, store_name),
           tagline = COALESCE($2, tagline),
           description_template = COALESCE($3, description_template),
           thumbnail_url = $4,
           banner_url = $5,
           tos_url = COALESCE($6, tos_url),
           rules_url = COALESCE($7, rules_url),
           support_url = COALESCE($8, support_url),
           sale_url = COALESCE($9, sale_url),
           discord_invite_url = COALESCE($10, discord_invite_url),
           website_url = COALESCE($11, website_url),
           updated_at = NOW(),
           updated_by = $12
         RETURNING *;`,
        [
          input.store_name ? sanitizeBrandText(input.store_name) : null,
          input.tagline ? sanitizeBrandText(input.tagline) : null,
          input.description_template ? sanitizeBrandText(input.description_template) : null,
          validateUrl(input.thumbnail_url),
          validateUrl(input.banner_url),
          validateUrl(input.tos_url),
          validateUrl(input.rules_url),
          validateUrl(input.support_url),
          validateUrl(input.sale_url),
          validateUrl(input.discord_invite_url),
          validateUrl(input.website_url),
          actor.discordId,
        ]
      );

      const updated = res.rows[0];

      // Bump menu version
      const stateRes = await client.query<{ current_version: string }>(
        `UPDATE menu_state SET current_version = current_version + 1, updated_at = NOW(), updated_by = $1 RETURNING current_version;`,
        [actor.discordId]
      );
      const newVersion = Number(stateRes.rows[0]?.current_version || 1);

      // Audit log
      await client.query(
        `INSERT INTO menu_audit_logs (actor_type, actor_id, source, action, before_json, after_json, menu_version, operation_id)
         VALUES ($1, $2, 'WEBSITE', 'UPDATE_SETTINGS', $3, $4, $5, $6);`,
        [actor.role, actor.discordId, JSON.stringify(current), JSON.stringify(updated), newVersion, traceId]
      );

      // Outbox event
      const eventRes = await client.query<{ id: string }>(
        `INSERT INTO menu_outbox_events (event_type, aggregate_type, aggregate_id, menu_version, payload, status)
         VALUES ('MENU_SETTINGS_CHANGED', 'SETTINGS', 'global', $1, $2, 'PENDING') RETURNING id;`,
        [
          newVersion,
          JSON.stringify({
            event_id: traceId,
            type: "MENU_SETTINGS_CHANGED",
            schema: "pade.menu.v2",
            aggregate_id: "global",
            public_version: newVersion,
            occurred_at: new Date().toISOString(),
            trace_id: traceId,
          }),
        ]
      );

      await client.query(
        `INSERT INTO menu_outbox_deliveries (event_id, consumer_name, status)
         VALUES ($1, 'discord_publisher', 'PENDING'),
                ($1, 'website_revalidate', 'PENDING');`,
        [eventRes.rows[0].id]
      );

      return updated;
    },
    { actorId: actor.discordId, source: "WEBSITE", traceId }
  );
}
