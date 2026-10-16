import { withTransaction, query } from "../db";
import { Actor, PublicationStatus, FailureReason } from "../types";
import { requirePermission, PERMISSIONS } from "../auth/rbac";
import { generateTraceId } from "../domain/reference";

export interface SyncOverview {
  websiteStatus: "SYNCED" | "OUT_OF_SYNC";
  currentVersion: number;
  discordStatus: PublicationStatus;
  discordReason?: FailureReason | string | null;
  botOnline: boolean;
  lastSyncAt?: string | null;
  deadEventsCount: number;
  pendingOutboxCount: number;
}

export async function getSyncOverview(): Promise<SyncOverview> {
  // 1. Current version
  const stateRows = await query<{ current_version: string | number }>(
    `SELECT current_version FROM menu_state ORDER BY updated_at DESC LIMIT 1;`
  );
  const currentVersion = stateRows.length > 0 ? Number(stateRows[0].current_version) : 1;

  // 2. Bot heartbeat check (§S9: bot heartbeat written every <= 15s)
  const hbRows = await query<{ last_heartbeat_at: Date }>(
    `SELECT last_heartbeat_at FROM menu_runtime_heartbeats WHERE service_name = 'discord_bot' LIMIT 1;`
  );
  let botOnline = false;
  if (hbRows.length > 0) {
    const elapsedMs = Date.now() - new Date(hbRows[0].last_heartbeat_at).getTime();
    botOnline = elapsedMs <= 45000; // 45s tolerance
  }

  // 3. Discord publication state
  const pubRows = await query<{
    menu_version: string | number;
    status: string;
    last_error_code: string | null;
    last_sync_at: string | null;
  }>(
    `SELECT menu_version, status, last_error_code, last_sync_at FROM menu_publications ORDER BY updated_at DESC LIMIT 1;`
  );

  let discordStatus: PublicationStatus = "PENDING";
  let discordReason: string | null = null;
  let lastSyncAt: string | null = null;

  if (pubRows.length > 0) {
    const pub = pubRows[0];
    lastSyncAt = pub.last_sync_at;
    discordReason = pub.last_error_code;
    const pubVersion = Number(pub.menu_version);

    if (!botOnline) {
      discordStatus = "PENDING"; // Pending Sync (bot offline)
    } else if (pub.status === "FAILED") {
      discordStatus = "FAILED";
    } else if (pubVersion < currentVersion) {
      discordStatus = "UPDATING";
    } else {
      discordStatus = "SYNCED";
    }
  } else {
    discordStatus = botOnline ? "OUT_OF_SYNC" : "PENDING";
  }

  // 4. Dead events & pending outbox
  const deadRows = await query<{ count: string }>(
    `SELECT count(*) as count FROM menu_outbox_deliveries WHERE status = 'DEAD';`
  );
  const deadEventsCount = parseInt(deadRows[0]?.count || "0", 10);

  const pendingRows = await query<{ count: string }>(
    `SELECT count(*) as count FROM menu_outbox_deliveries WHERE status IN ('PENDING', 'IN_FLIGHT');`
  );
  const pendingOutboxCount = parseInt(pendingRows[0]?.count || "0", 10);

  return {
    websiteStatus: "SYNCED",
    currentVersion,
    discordStatus,
    discordReason,
    botOnline,
    lastSyncAt,
    deadEventsCount,
    pendingOutboxCount,
  };
}

export async function enqueueRepairPublication(actor: Actor): Promise<void> {
  requirePermission(actor, PERMISSIONS.SYNC);
  const traceId = generateTraceId();

  await withTransaction(
    async (client) => {
      const stateRes = await client.query<{ current_version: string }>(
        `SELECT current_version FROM menu_state ORDER BY updated_at DESC LIMIT 1;`
      );
      const version = Number(stateRes.rows[0]?.current_version || 1);

      const eventRes = await client.query<{ id: string }>(
        `INSERT INTO menu_outbox_events (event_type, aggregate_type, aggregate_id, menu_version, payload, status)
         VALUES ('MENU_PUBLICATION_REPAIR_REQUESTED', 'PUBLICATION', 'global', $1, $2, 'PENDING') RETURNING id;`,
        [
          version,
          JSON.stringify({
            event_id: traceId,
            type: "MENU_PUBLICATION_REPAIR_REQUESTED",
            schema: "pade.menu.v2",
            aggregate_id: "global",
            public_version: version,
            occurred_at: new Date().toISOString(),
            trace_id: traceId,
          }),
        ]
      );

      await client.query(
        `INSERT INTO menu_outbox_deliveries (event_id, consumer_name, status)
         VALUES ($1, 'discord_publisher', 'PENDING');`,
        [eventRes.rows[0].id]
      );

      await client.query(
        `INSERT INTO menu_audit_logs (actor_type, actor_id, source, action, menu_version, operation_id)
         VALUES ($1, $2, 'WEBSITE', 'SYNC_DISCORD_REQUESTED', $3, $4);`,
        [actor.role, actor.discordId, version, traceId]
      );
    },
    { actorId: actor.discordId, source: "WEBSITE", traceId }
  );
}

export async function retryDeadOutboxEvents(actor: Actor): Promise<number> {
  requirePermission(actor, PERMISSIONS.SYNC);
  const res = await query(
    `UPDATE menu_outbox_deliveries
     SET status = 'PENDING', attempts = 0, next_attempt_at = NOW(), last_error = NULL, updated_at = NOW()
     WHERE status = 'DEAD';`
  );
  return (res as any).rowCount || 0;
}
