/**
 * ============================================================================
 * PADE STORE CANONICAL TRANSCRIPT VIEW MODEL V3 (JavaScript / TypeScript mirror)
 * ============================================================================
 * Single Source of Render Truth for Web Viewer & Standalone HTML Exporter.
 * ============================================================================
 */

function createEmptyTranscriptViewModel() {
  return {
    schema_version: 3,
    renderer_version: 'pade-transcript-v3',
    meta: {
      public_id: '',
      display_code: '',
      ticket_name: '',
      guild: {
        id: '',
        name: 'Pade Store',
        icon_asset_id: '',
        icon_url: ''
      },
      opened_at: new Date().toISOString(),
      closed_at: new Date().toISOString(),
      duration_sec: 0,
      timezone: 'Asia/Ho_Chi_Minh',
      locale: 'vi-VN',
      fidelity: 'v3',
      status: 'READY',
      warnings: [],
      counts: {
        messages: 0,
        participants: 0,
        attachments: 0,
        stickers: 0,
        embeds: 0,
        reactions: 0,
        role_icons: 0,
        emoji: 0,
        media: 0
      }
    },
    assets: {},
    users: {},
    roles: {},
    channels: {},
    messages: []
  };
}

module.exports = {
  createEmptyTranscriptViewModel
};
