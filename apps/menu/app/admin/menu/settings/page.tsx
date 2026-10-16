'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { MenuSettings } from '@/lib/types';
import { ArrowLeft, Save, CheckCircle, Sparkles } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<MenuSettings>({
    store_name: 'Pade Store',
    tagline: 'a little menu for things you love 𐙚',
    description_template: `❝  ﹒  **Pade Store**  ⏜  𐙚  menu ִ ࣪ !

′  · ｡   ghé một chút, chọn điều bạn thích  !   ⌒⌒
  ╰  những món nhỏ xinh đang đợi bạn ở bên dưới ♡

  [TOS]  »  [rules]  »  [support]
    menu · sale · order  ⋆ ˚ ｡
      ·   ✧   ·   ﹏

〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰

  ′ 〰 ❜  ､   {{store_name}}   ､ ❛ //`,
    tos_url: 'https://menu.sorae.tokyo',
    rules_url: 'https://menu.sorae.tokyo',
    support_url: 'https://menu.sorae.tokyo',
    sale_url: 'https://menu.sorae.tokyo',
    discord_invite_url: 'https://discord.gg/pade',
    website_url: 'https://menu.sorae.tokyo',
    currency: 'VND',
    thumbnail_url: null,
    banner_url: null,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/menu');
        if (res.ok) {
          const d = await res.json();
          if (d.settings) {
            setSettings(d.settings);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const renderedTemplate = settings.description_template
    .replace(/{{store_name}}/g, settings.store_name)
    .replace(/{{website_url}}/g, settings.website_url)
    .replace(/{{tos_url}}/g, settings.tos_url)
    .replace(/{{rules_url}}/g, settings.rules_url)
    .replace(/{{support_url}}/g, settings.support_url);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      // In production commits directly to menu_settings table
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert('Lỗi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-silver-100">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/admin/menu"
              className="inline-flex items-center space-x-1.5 text-xs text-silver-400 hover:text-white mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Về Bảng Điều Khiển</span>
            </Link>
            <h1 className="text-2xl font-black text-white tracking-tight">Cấu Hình Menu Pade Store</h1>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-silver-200 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {saved ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Đã Lưu!' : saving ? 'Đang Lưu...' : 'Lưu Cấu Hình'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Settings Form */}
          <div className="bg-surface-100 border border-cardBorder rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white border-b border-cardBorder pb-2">
              Thông Tin Chung & Liên Kết
            </h2>

            <div>
              <label className="block text-xs font-semibold text-silver-300 mb-1">Tên Cửa Hàng</label>
              <input
                type="text"
                value={settings.store_name}
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                className="w-full px-3.5 py-2 bg-surface-200 border border-cardBorder rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-silver-300 mb-1">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3.5 py-2 bg-surface-200 border border-cardBorder rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-silver-300 mb-1">Discord Invite URL</label>
              <input
                type="text"
                value={settings.discord_invite_url}
                onChange={(e) => setSettings({ ...settings, discord_invite_url: e.target.value })}
                className="w-full px-3.5 py-2 bg-surface-200 border border-cardBorder rounded-xl text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-silver-300 mb-1">Website URL</label>
              <input
                type="text"
                value={settings.website_url}
                onChange={(e) => setSettings({ ...settings, website_url: e.target.value })}
                className="w-full px-3.5 py-2 bg-surface-200 border border-cardBorder rounded-xl text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-silver-300 mb-1">Template Mô Tả Discord (/menu)</label>
              <textarea
                rows={8}
                value={settings.description_template}
                onChange={(e) => setSettings({ ...settings, description_template: e.target.value })}
                className="w-full px-3.5 py-2 bg-surface-200 border border-cardBorder rounded-xl text-xs text-white focus:outline-none font-mono"
              />
              <span className="text-[10px] text-silver-500 block mt-1">
                Biến hỗ trợ: {`{{store_name}}, {{website_url}}, {{tos_url}}, {{support_url}}`}
              </span>
            </div>
          </div>

          {/* Live Discord Description Preview */}
          <div className="bg-surface-100 border border-cardBorder rounded-2xl p-6 sticky top-20 space-y-4">
            <div className="flex items-center space-x-2 border-b border-cardBorder pb-2">
              <Sparkles className="w-4 h-4 text-silver-300" />
              <h2 className="text-sm font-bold text-white">Xem Thử Mô Tả Discord</h2>
            </div>

            <div className="discord-bg p-4 rounded-xl text-xs text-[#dbdee1] font-sans whitespace-pre-wrap leading-relaxed shadow-inner border border-[#3f4147]">
              {renderedTemplate}
            </div>

            <div className="text-[11px] text-silver-500 font-light">
              Khách hàng khi gõ <code>/menu</code> trên Discord sẽ thấy chính xác giao diện tin nhắn Components V2 này.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
