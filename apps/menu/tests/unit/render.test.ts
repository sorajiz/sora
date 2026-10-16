import { describe, it, expect } from 'vitest';
import { renderDiscordMenuPayload } from '@/lib/render/discord-payload';
import goldenFixtures from '../../../../contracts/menu/fixtures/render/golden.json';

describe('Discord Menu Render Parity (§S12)', () => {
  it('matches golden fixtures byte-for-byte in canonical JSON', () => {
    for (const testCase of goldenFixtures.cases) {
      const payload = renderDiscordMenuPayload(testCase.input as any);
      
      // Compare canonical JSON serialization
      const actualJson = JSON.parse(JSON.stringify(payload));
      const expectedJson = JSON.parse(JSON.stringify(testCase.expected_payload));

      expect(actualJson).toEqual(expectedJson);
    }
  });

  it('caps Discord select options at 25 items', () => {
    const products = Array.from({ length: 35 }, (_, i) => ({
      sku: `PROD-${i + 1}`,
      name: `Product ${i + 1}`,
      price_amount: 50000,
      status: 'ACTIVE',
      discord_select_label: `Product ${i + 1}`,
      discord_select_description: `Desc ${i + 1}`
    }));

    const payload = renderDiscordMenuPayload({
      store_name: 'Pade Store',
      products
    });

    const selectComponent = payload.components[0].components[0] as any;
    expect(selectComponent.options.length).toBe(25);
    expect(selectComponent.options[0].value).toBe('PROD-1');
    expect(selectComponent.options[24].value).toBe('PROD-25');
  });

  it('appends (Hết hàng) and [Hết hàng] correctly for sold out items', () => {
    const payload = renderDiscordMenuPayload({
      products: [
        {
          sku: 'OUT-OF-STOCK',
          name: 'Rare Item',
          price_amount: 100000,
          status: 'SOLD_OUT',
          discord_select_label: 'Rare Item',
          discord_select_description: 'Fast delivery'
        }
      ]
    });

    const opt = (payload.components[0].components[0] as any).options[0];
    expect(opt.label).toBe('Rare Item (Hết hàng)');
    expect(opt.description).toBe('[Hết hàng] Fast delivery - ₫100.000');
  });
});
