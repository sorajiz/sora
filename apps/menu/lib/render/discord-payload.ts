import { formatBrandMoney } from "../domain/money";
import { truncateGraphemes } from "../domain/text";

export interface DiscordSelectOption {
  label: string;
  value: string;
  description?: string;
  emoji?: {
    name: string;
    id?: string;
    animated?: boolean;
  };
}

export interface DiscordSelectMenuComponent {
  type: 3;
  custom_id: string;
  placeholder?: string;
  options: DiscordSelectOption[];
}

export interface DiscordActionRowComponent {
  type: 1;
  components: (DiscordSelectMenuComponent | any)[];
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  thumbnail?: { url: string };
  image?: { url: string };
  footer?: { text: string };
  fields?: { name: string; value: string; inline?: boolean }[];
}

export interface DiscordPayload {
  embeds: DiscordEmbed[];
  components: DiscordActionRowComponent[];
}

export interface RenderViewModel {
  store_name?: string;
  menu_description?: string;
  thumbnail_url?: string | null;
  banner_url?: string | null;
  products: {
    sku: string;
    name: string;
    price_amount: number | string;
    status: string;
    discord_select_label?: string | null;
    discord_select_description?: string | null;
    discord_select_emoji_name?: string | null;
    discord_select_emoji_id?: string | null;
    discord_select_emoji_animated?: boolean;
  }[];
}

/**
 * Pure function Render(viewModel) -> DiscordPayload (§S12)
 * TypeScript port of Go bot renderer, byte-identical to golden fixtures.
 */
export function renderDiscordMenuPayload(vm: RenderViewModel): DiscordPayload {
  const storeName = vm.store_name || "Pade Store";
  const description = vm.menu_description || "❝  ﹒  **Pade Store**  ⏜  𐙚  menu ִ ࣪ !";

  const embed: DiscordEmbed = {
    title: storeName,
    description: description,
    color: 855309, // 0x0D0D0D brand dark
  };

  if (vm.thumbnail_url) {
    embed.thumbnail = { url: vm.thumbnail_url };
  }
  if (vm.banner_url) {
    embed.image = { url: vm.banner_url };
  }

  const activeProducts = (vm.products || []).filter(
    (p) => p.status === "ACTIVE" || p.status === "SOLD_OUT"
  );

  if (activeProducts.length === 0) {
    return {
      embeds: [embed],
      components: [],
    };
  }

  // Up to 25 options per Discord select menu limit
  const options: DiscordSelectOption[] = activeProducts.slice(0, 25).map((p) => {
    const isSoldOut = p.status === "SOLD_OUT";
    const baseLabel = p.discord_select_label || p.name;
    const label = isSoldOut && !baseLabel.includes("(Hết hàng)")
      ? truncateGraphemes(`${baseLabel} (Hết hàng)`, 100)
      : truncateGraphemes(baseLabel, 100);

    const priceFormatted = formatBrandMoney(p.price_amount);
    let desc = p.discord_select_description || "";
    if (isSoldOut && !desc.startsWith("[Hết hàng]")) {
      desc = `[Hết hàng] ${desc}`;
    }
    const fullDesc = desc ? `${desc} - ${priceFormatted}` : priceFormatted;

    const opt: DiscordSelectOption = {
      label,
      value: p.sku,
      description: truncateGraphemes(fullDesc, 100),
    };

    if (p.discord_select_emoji_name) {
      opt.emoji = {
        name: p.discord_select_emoji_name,
        ...(p.discord_select_emoji_id ? { id: p.discord_select_emoji_id } : {}),
        ...(p.discord_select_emoji_animated ? { animated: true } : {}),
      };
    }

    return opt;
  });

  const selectRow: DiscordActionRowComponent = {
    type: 1,
    components: [
      {
        type: 3,
        custom_id: "menu:select_product",
        placeholder: "Chọn sản phẩm bạn muốn xem...",
        options,
      },
    ],
  };

  return {
    embeds: [embed],
    components: [selectRow],
  };
}
