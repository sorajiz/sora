/**
 * ============================================================================
 * PADE STORE TICKET TRANSCRIPT PLATFORM - POSTGRESQL CLIENT
 * ============================================================================
 * High-performance, connection-pooled database client for Vercel Serverless.
 * Safely fetches structured transcripts without asking the Discord Bot.
 * ============================================================================
 */

const { Pool } = require('pg');

let pool = null;

function getPool() {
  const dbUrl = (process.env.DATABASE_URL || process.env.POSTGRES_URL || '').trim();
  if (!dbUrl) {
    return null;
  }
  if (!pool) {
    pool = new Pool({
      connectionString: dbUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false }
    });
  }
  return pool;
}

async function getTranscriptFromDB(publicId) {
  const p = getPool();
  if (!p) return null;

  try {
    // 1. Fetch transcript metadata
    const tRes = await p.query(
      `SELECT id, close_operation_id, public_id, ticket_name, owner_discord_id, guild_id,
              opened_at, closed_at, closed_by_discord_id, message_count,
              participant_count, attachment_count, image_count, video_count,
              audio_count, embed_count, sticker_count, reaction_count,
              content_hash, manifest_hash, status, schema_version,
              renderer_version, created_at, ready_at, revoked_at
       FROM ticket_transcripts
       WHERE public_id = $1 OR ticket_name = $1
       LIMIT 1`,
      [publicId]
    );

    if (tRes.rows.length === 0) {
      return null;
    }

    const transcript = tRes.rows[0];
    const transcriptId = transcript.id;

    // 2. Fetch users snapshot
    const uRes = await p.query(
      `SELECT discord_user_id, username, global_name, guild_display_name,
              avatar_hash, guild_avatar_hash, avatar_url, is_bot, is_system,
              display_color_role, display_color, display_icon_role,
              display_icon_asset_id, display_unicode_emoji, member_left
       FROM ticket_user_snapshots
       WHERE transcript_id = $1`,
      [transcriptId]
    );
    const users = {};
    for (const u of uRes.rows) {
      users[u.discord_user_id] = u;
    }

    // 2b. Fetch roles snapshot
    const rRes = await p.query(
      `SELECT discord_role_id, role_name, position, color,
              icon_hash, icon_asset_id, icon_url, unicode_emoji
       FROM ticket_role_snapshots
       WHERE transcript_id = $1`,
      [transcriptId]
    );
    const roles = {};
    for (const r of rRes.rows) {
      roles[r.discord_role_id] = r;
    }

    // Connect user role icons if available
    for (const u of Object.values(users)) {
      if (u.display_icon_role) {
        for (const r of Object.values(roles)) {
          if (r.role_name === u.display_icon_role) {
            if (r.icon_url) u.display_icon_url = r.icon_url;
            if (r.unicode_emoji) u.display_unicode_emoji = r.unicode_emoji;
            break;
          }
        }
      }
    }

    // 3. Fetch messages in strict chronological order
    const mRes = await p.query(
      `SELECT id, discord_message_id, author_id, content_original, content_rendered,
              message_type, pinned, is_edited, timestamp, edited_timestamp, seq_order
       FROM ticket_messages
       WHERE transcript_id = $1
       ORDER BY seq_order ASC`,
      [transcriptId]
    );

    // 4. Fetch attachments
    const aRes = await p.query(
      `SELECT message_id, discord_attachment_id, filename, content_type,
              size_bytes, width, height, duration_secs, source_url, r2_url
       FROM ticket_attachments
       WHERE transcript_id = $1`,
      [transcriptId]
    );
    const attachmentsByMsg = {};
    for (const a of aRes.rows) {
      if (!attachmentsByMsg[a.message_id]) attachmentsByMsg[a.message_id] = [];
      attachmentsByMsg[a.message_id].push(a);
    }

    // 5. Fetch embeds & fields
    const eRes = await p.query(
      `SELECT e.id, e.message_id, e.title, e.description, e.url, e.color,
              e.timestamp, e.author_name, e.author_url, e.author_icon_url,
              e.footer_text, e.footer_icon_url, e.thumbnail_url, e.image_url,
              COALESCE(
                json_agg(
                  json_build_object('name', f.name, 'value', f.value, 'inline', f.inline)
                  ORDER BY f.field_index ASC
                ) FILTER (WHERE f.id IS NOT NULL), '[]'
              ) as fields
       FROM ticket_embeds e
       LEFT JOIN ticket_embed_fields f ON f.embed_id = e.id
       WHERE e.transcript_id = $1
       GROUP BY e.id`,
      [transcriptId]
    );
    const embedsByMsg = {};
    for (const e of eRes.rows) {
      if (!embedsByMsg[e.message_id]) embedsByMsg[e.message_id] = [];
      embedsByMsg[e.message_id].push(e);
    }

    // 6. Fetch reactions
    const reactRes = await p.query(
      `SELECT message_id, emoji_id, emoji_name, animated, count
       FROM ticket_reactions
       WHERE transcript_id = $1`,
      [transcriptId]
    );
    const reactionsByMsg = {};
    for (const r of reactRes.rows) {
      if (!reactionsByMsg[r.message_id]) reactionsByMsg[r.message_id] = [];
      reactionsByMsg[r.message_id].push(r);
    }

    // 7. Fetch stickers
    const stickersByMsg = {};
    try {
      const sRes = await p.query(
        `SELECT message_id, discord_sticker_id, name, description, format_type, source_url, r2_url
         FROM ticket_stickers
         WHERE transcript_id = $1`,
        [transcriptId]
      );
      for (const s of sRes.rows) {
        if (!stickersByMsg[s.message_id]) stickersByMsg[s.message_id] = [];
        stickersByMsg[s.message_id].push(s);
      }
    } catch (sErr) {
      // Table might be empty or optional
    }

    // 8. Fetch components v2
    const componentsByMsg = {};
    try {
      const cRes = await p.query(
        `SELECT message_id, component_tree
         FROM ticket_components
         WHERE transcript_id = $1`,
        [transcriptId]
      );
      for (const c of cRes.rows) {
        componentsByMsg[c.message_id] = c.component_tree;
      }
    } catch (cErr) {
      // Components table optional
    }

    // Combine into full message payload
    const messages = mRes.rows.map(m => ({
      ...m,
      attachments: attachmentsByMsg[m.id] || [],
      embeds: embedsByMsg[m.id] || [],
      reactions: reactionsByMsg[m.id] || [],
      stickers: stickersByMsg[m.id] || [],
      components: componentsByMsg[m.id] || null
    }));

    return {
      transcript,
      users,
      roles,
      messages
    };
  } catch (err) {
    console.error('[DATABASE] Error reading transcript from PostgreSQL:', err);
    return null;
  }
}

async function getMediaAssetFromDB(publicId, assetId) {
  const p = getPool();
  if (!p) return null;

  try {
    const res = await p.query(
      `SELECT a.content_type, a.size_bytes, a.data, a.sha256
       FROM ticket_media_assets a
       JOIN ticket_transcripts t ON t.id = a.transcript_id
       WHERE (t.public_id = $1 OR t.ticket_name = $1)
         AND a.asset_id = $2
       LIMIT 1`,
      [publicId, assetId]
    );

    if (res.rows.length === 0) {
      return null;
    }
    return res.rows[0];
  } catch (err) {
    console.error('[DATABASE] Error reading media asset:', err);
    return null;
  }
}

module.exports = {
  getPool,
  getTranscriptFromDB,
  getMediaAssetFromDB
};
