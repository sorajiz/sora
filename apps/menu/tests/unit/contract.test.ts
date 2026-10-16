import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Shared Contract & Drift Verification (§S2)', () => {
  const contractDir = path.resolve(__dirname, '../../../../contracts/menu');

  it('verifies all required contract artifacts exist', () => {
    const requiredFiles = [
      'CONTRACT_VERSION',
      'limits.json',
      'copy.vi.json',
      'events.schema.json',
      'schema.snapshot.sql',
      'fixtures/text/money.json',
      'fixtures/text/unicode.json',
      'fixtures/text/markdown.json',
      'fixtures/render/golden.json'
    ];

    for (const rel of requiredFiles) {
      const fullPath = path.join(contractDir, rel);
      expect(fs.existsSync(fullPath), `Missing contract file: ${rel}`).toBe(true);
    }
  });

  it('verifies CONTRACT_VERSION matches 2.1.0', () => {
    const versionPath = path.join(contractDir, 'CONTRACT_VERSION');
    const version = fs.readFileSync(versionPath, 'utf8').trim();
    expect(version).toBe('2.1.0');
  });

  it('verifies limits.json contains verified URLs for Discord limits', () => {
    const limitsPath = path.join(contractDir, 'limits.json');
    const data = JSON.parse(fs.readFileSync(limitsPath, 'utf8'));

    const limits = data.limits;
    expect(limits.discord_embed_title.max_length).toBe(256);
    expect(limits.discord_embed_description.max_length).toBe(4096);
    expect(limits.discord_select_menu_options_count.max).toBe(25);
    expect(limits.discord_select_menu_label.max_length).toBe(100);
    expect(limits.discord_select_menu_description.max_length).toBe(100);
    expect(limits.discord_select_menu_label.official_docs_url).toContain('discord.com');
  });
});

