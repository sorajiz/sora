-- +goose Up
-- =====================================================================
-- PADE STORE MENU PLATFORM V2 CANONICAL EXTENSIONS
-- =====================================================================

-- 9. menu_outbox_deliveries
CREATE TABLE IF NOT EXISTS menu_outbox_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES menu_outbox_events(id) ON DELETE CASCADE,
    consumer_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    attempts INT NOT NULL DEFAULT 0,
    next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_delivery_event_consumer UNIQUE(event_id, consumer_name)
);

-- 10. menu_emoji_catalog
CREATE TABLE IF NOT EXISTS menu_emoji_catalog (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    animated BOOLEAN NOT NULL DEFAULT false,
    scope TEXT NOT NULL DEFAULT 'GUILD',
    available BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. menu_admin_grants
CREATE TABLE IF NOT EXISTS menu_admin_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discord_user_id TEXT UNIQUE NOT NULL,
    granted_by TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. menu_role_bindings
CREATE TABLE IF NOT EXISTS menu_role_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    role_tier TEXT NOT NULL DEFAULT 'ADMIN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_role_binding UNIQUE(guild_id, role_id)
);

-- 13. menu_runtime_heartbeats
CREATE TABLE IF NOT EXISTS menu_runtime_heartbeats (
    service_name TEXT PRIMARY KEY,
    last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 14. menu_web_sessions (Server-side web auth sessions per §5.2)
CREATE TABLE IF NOT EXISTS menu_web_sessions (
    id TEXT PRIMARY KEY,
    discord_id TEXT NOT NULL,
    username TEXT NOT NULL,
    avatar TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    ip_hash TEXT,
    user_agent_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_menu_web_sessions_discord_id ON menu_web_sessions(discord_id);
CREATE INDEX IF NOT EXISTS idx_menu_web_sessions_expires_at ON menu_web_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_menu_products_status ON menu_products(status);
CREATE INDEX IF NOT EXISTS idx_menu_products_category ON menu_products(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_outbox_events_status ON menu_outbox_events(status);

-- +goose Down
DROP TABLE IF EXISTS menu_web_sessions;
DROP TABLE IF EXISTS menu_runtime_heartbeats;
DROP TABLE IF EXISTS menu_role_bindings;
DROP TABLE IF EXISTS menu_admin_grants;
DROP TABLE IF EXISTS menu_emoji_catalog;
DROP TABLE IF EXISTS menu_outbox_deliveries;
