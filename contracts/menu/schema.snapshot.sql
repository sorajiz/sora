-- =====================================================================
-- PADE STORE MENU V2 CANONICAL SCHEMA SNAPSHOT (contracts/menu/schema.snapshot.sql)
-- Version: 2.1.0
-- Integration Surface: PostgreSQL (Neon / AWS Aurora)
-- =====================================================================

-- 1. menu_categories
CREATE TABLE IF NOT EXISTS menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    emoji TEXT,
    image_asset_id TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. menu_products
CREATE TABLE IF NOT EXISTS menu_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    short_description TEXT,
    description TEXT,
    category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
    price_amount BIGINT NOT NULL CHECK (price_amount >= 0 AND price_amount <= 9007199254740991),
    currency TEXT NOT NULL DEFAULT 'VND',
    compare_at_price BIGINT CHECK (compare_at_price IS NULL OR compare_at_price > price_amount),
    stock_mode TEXT NOT NULL DEFAULT 'UNLIMITED',
    stock_quantity BIGINT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_available BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    discord_select_label TEXT,
    discord_select_description TEXT,
    discord_select_emoji_name TEXT,
    discord_select_emoji_id TEXT,
    discord_select_emoji_animated BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 1,
    created_by TEXT,
    updated_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by TEXT
);

-- 3. menu_product_media
CREATE TABLE IF NOT EXISTS menu_product_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES menu_products(id) ON DELETE CASCADE,
    asset_id TEXT NOT NULL,
    media_type TEXT NOT NULL DEFAULT 'IMAGE',
    url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. menu_settings
CREATE TABLE IF NOT EXISTS menu_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name TEXT NOT NULL DEFAULT 'Pade Store',
    tagline TEXT NOT NULL DEFAULT 'a little menu for things you love 𐙚',
    description_template TEXT NOT NULL,
    thumbnail_url TEXT,
    banner_url TEXT,
    tos_url TEXT DEFAULT 'https://menu.sorae.tokyo/tos',
    rules_url TEXT DEFAULT 'https://menu.sorae.tokyo/rules',
    support_url TEXT DEFAULT 'https://discord.gg/pade',
    sale_url TEXT DEFAULT 'https://menu.sorae.tokyo/sale',
    discord_invite_url TEXT DEFAULT 'https://discord.gg/pade',
    website_url TEXT NOT NULL DEFAULT 'https://menu.sorae.tokyo',
    currency TEXT NOT NULL DEFAULT 'VND',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by TEXT
);

-- 5. menu_state
CREATE TABLE IF NOT EXISTS menu_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    current_version BIGINT NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by TEXT
);

-- 6. menu_publications
CREATE TABLE IF NOT EXISTS menu_publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    publication_type TEXT NOT NULL DEFAULT 'MAIN_MENU',
    menu_version BIGINT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    last_sync_at TIMESTAMPTZ,
    last_error_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_publication_guild_channel_msg UNIQUE(guild_id, channel_id, message_id)
);

-- 7. menu_audit_logs
CREATE TABLE IF NOT EXISTS menu_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_type TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    source TEXT NOT NULL,
    action TEXT NOT NULL,
    product_id UUID,
    category_id UUID,
    before_json JSONB,
    after_json JSONB,
    menu_version BIGINT NOT NULL,
    operation_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. menu_outbox_events
CREATE TABLE IF NOT EXISTS menu_outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    aggregate_type TEXT NOT NULL DEFAULT 'MENU',
    aggregate_id TEXT NOT NULL,
    menu_version BIGINT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'PENDING',
    attempt_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    last_error TEXT
);

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
