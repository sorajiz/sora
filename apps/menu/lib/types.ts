import { formatBrandMoney } from "./domain/money";

export type ProductStatus = "DRAFT" | "ACTIVE" | "SOLD_OUT" | "HIDDEN" | "ARCHIVED";
export type StockMode = "UNLIMITED" | "TRACKED" | "MANUAL";
export type RoleTier = "OWNER" | "ADMIN" | "MEMBER" | "GUEST";
export type PublicationStatus = "SYNCED" | "UPDATING" | "PENDING" | "OUT_OF_SYNC" | "FAILED" | "MESSAGE_MISSING";
export type FailureReason = "MISSING_PERMISSIONS" | "MISSING_CHANNEL" | "RATE_LIMITED" | "INVALID_PAYLOAD" | "UNKNOWN";
export type OutboxDeliveryStatus = "PENDING" | "IN_FLIGHT" | "DONE" | "FAILED" | "DEAD";

export interface MenuProduct {
  id: string;
  sku: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  category_name?: string | null;
  category_slug?: string | null;
  category_emoji?: string | null;
  price_amount: string | number; // Exact minor unit (VND)
  currency: string;
  compare_at_price: string | number | null;
  stock_mode: StockMode;
  stock_quantity: number;
  status: ProductStatus;
  is_featured: boolean;
  is_available: boolean;
  sort_order: number;
  discord_select_label: string | null;
  discord_select_description: string | null;
  discord_select_emoji_name: string | null;
  discord_select_emoji_id: string | null; // Discord snowflake string
  discord_select_emoji_animated: boolean;
  primary_image?: string | null;
  media_urls?: string[];
  version: number;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface MenuCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  emoji: string | null;
  image_asset_id: string | null;
  sort_order: number;
  status: "ACTIVE" | "HIDDEN" | "ARCHIVED";
  product_count?: number;
  created_at: string;
  updated_at: string;
}

export interface MenuProductMedia {
  id: string;
  product_id: string;
  asset_id: string;
  media_type: "IMAGE" | "GIF" | "VIDEO";
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface MenuSettings {
  id?: string;
  store_name: string;
  tagline: string;
  description_template: string;
  thumbnail_url: string | null;
  banner_url: string | null;
  tos_url: string;
  rules_url: string;
  support_url: string;
  sale_url: string;
  discord_invite_url: string;
  website_url: string;
  currency: string;
  updated_at?: string;
  updated_by?: string | null;
}

export interface MenuPublication {
  id: string;
  guild_id: string;
  channel_id: string;
  message_id: string;
  publication_type: string;
  menu_version: number;
  status: PublicationStatus;
  last_sync_at: string | null;
  last_error_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface MenuAuditLog {
  id: string;
  actor_type: string;
  actor_id: string;
  source: "WEBSITE" | "DISCORD" | "SYSTEM";
  action: string;
  product_id: string | null;
  category_id: string | null;
  before_json: Record<string, any> | null;
  after_json: Record<string, any> | null;
  menu_version: number;
  operation_id: string | null;
  created_at: string;
}

export interface Actor {
  discordId: string; // Strictly string (Snowflake > 2^53)
  username: string;
  avatar: string | null;
  role: RoleTier;
  permissions: Set<string>;
}

export { formatBrandMoney };
