'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../components/Navbar';
import { MenuProduct, MenuCategory, MenuSettings, MenuAuditLog } from '../../../lib/types';
import { DiscordComponents } from '../../../components/DiscordComponents';
import { renderDiscordMenuPayload } from '../../../lib/render/discord-payload';
import { formatBrandMoney } from '../../../lib/domain/money';
import {
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Edit2,
  Archive,
  Layers,
  Settings,
  Activity,
  History,
  Shield,
} from 'lucide-react';

export default function AdminMenuPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'settings' | 'sync' | 'audit'>('products');
  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [settings, setSettings] = useState<MenuSettings | null>(null);
  const [syncOverview, setSyncOverview] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<MenuAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [syncing, setSyncing] = useState(false);

  // Settings form local state
  const [storeName, setStoreName] = useState('');
  const [tagline, setTagline] = useState('');
  const [descTemplate, setDescTemplate] = useState('');
  const [tosUrl, setTosUrl] = useState('');
  const [rulesUrl, setRulesUrl] = useState('');
  const [supportUrl, setSupportUrl] = useState('');
  const [saleUrl, setSaleUrl] = useState('');
  const [discordInviteUrl, setDiscordInviteUrl] = useState('');

  // Category new form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('📦');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pRes, cRes, sRes, syncRes, aRes] = await Promise.all([
        fetch('/api/admin/menu/products'),
        fetch('/api/admin/menu/categories'),
        fetch('/api/admin/menu/settings'),
        fetch('/api/admin/menu/sync'),
        fetch('/api/admin/menu/audit'),
      ]);

      if (pRes.ok) {
        const pData = await pRes.json();
        setProducts(pData.products || []);
      }
      if (cRes.ok) {
        const cData = await cRes.json();
        setCategories(cData.categories || []);
      }
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData.settings) {
          setSettings(sData.settings);
          setStoreName(sData.settings.store_name || '');
          setTagline(sData.settings.tagline || '');
          setDescTemplate(sData.settings.description_template || '');
          setTosUrl(sData.settings.tos_url || '');
          setRulesUrl(sData.settings.rules_url || '');
          setSupportUrl(sData.settings.support_url || '');
          setSaleUrl(sData.settings.sale_url || '');
          setDiscordInviteUrl(sData.settings.discord_invite_url || '');
        }
      }
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        setSyncOverview(syncData);
      }
      if (aRes.ok) {
        const aData = await aRes.json();
        setAuditLogs(aData.logs || []);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleArchiveProduct = async (id: string, name: string, version: number) => {
    if (!confirm(`Bạn có chắc chắn muốn lưu trữ sản phẩm "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/menu/products/${id}?expected_version=${version}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMsg(`Đã lưu trữ "${name}"`);
        loadAll();
      }
    } catch (e: any) {
      alert(`Lỗi: ${e.message}`);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await fetch('/api/admin/menu/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName, emoji: newCatEmoji }),
      });
      if (res.ok) {
        setNewCatName('');
        setMsg('Đã tạo danh mục mới!');
        loadAll();
      }
    } catch (e: any) {
      alert(`Lỗi: ${e.message}`);
    }
  };

  const handleArchiveCategory = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn lưu trữ danh mục "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/menu/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMsg(`Đã lưu trữ danh mục "${name}"`);
        loadAll();
      } else {
        const data = await res.json();
        alert(`Lỗi: ${data.error}`);
      }
    } catch (e: any) {
      alert(`Lỗi: ${e.message}`);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/menu/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_name: storeName,
          tagline,
          description_template: descTemplate,
          tos_url: tosUrl,
          rules_url: rulesUrl,
          support_url: supportUrl,
          sale_url: saleUrl,
          discord_invite_url: discordInviteUrl,
        }),
      });
      if (res.ok) {
        setMsg('Đã cập nhật cài đặt thành công!');
        loadAll();
      } else {
        const d = await res.json();
        alert(`Lỗi: ${d.error}`);
      }
    } catch (e: any) {
      alert(`Lỗi: ${e.message}`);
    }
  };

  const handleTriggerSync = async () => {
    setSyncing(true);
    setMsg('');
    try {
      const res = await fetch('/api/admin/menu/sync', { method: 'POST' });
      if (res.ok) {
        setMsg('Đã kích hoạt đồng bộ Discord thành công!');
        loadAll();
      }
    } catch (e: any) {
      alert(`Lỗi: ${e.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleRetryDeadOutbox = async () => {
    try {
      const res = await fetch('/api/admin/menu/sync', { method: 'PUT' });
      if (res.ok) {
        setMsg('Đã đưa các sự kiện outbox DEAD vào hàng đợi thử lại!');
        loadAll();
      }
    } catch (e: any) {
      alert(`Lỗi: ${e.message}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--void)] text-[var(--off-white)]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
          <div>
            <div className="flex items-center space-x-2 text-xs text-[var(--ash)] mb-1">
              <span>Pade Store</span>
              <span>/</span>
              <span className="text-[var(--white)] font-medium">Admin Workspace</span>
            </div>
            <h1 className="text-xl font-bold text-white font-display">Quản Trị Bảng Menu V2</h1>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={loadAll}
              className="p-2 rounded-xl bg-[var(--ink)] hover:bg-[var(--graphite)] border border-[var(--line)] text-xs text-[var(--ash)] hover:text-white transition-colors"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              href="/admin/menu/products/new"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[var(--off-white)] text-[var(--void)] text-xs font-semibold hover:bg-[var(--white)] transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Sản Phẩm</span>
            </Link>
          </div>
        </div>

        {/* Status Message Notification */}
        {msg && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
            <span>{msg}</span>
            <button onClick={() => setMsg('')} className="text-[10px] text-emerald-400 font-bold hover:underline">
              Đóng
            </button>
          </div>
        )}

        {/* Navigation Tabs Bar (§8) */}
        <div className="flex items-center space-x-2 border-b border-[var(--line)] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'products'
                ? 'bg-[var(--steel)] text-white font-semibold'
                : 'text-[var(--ash)] hover:text-white hover:bg-[var(--ink)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sản Phẩm ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'categories'
                ? 'bg-[var(--steel)] text-white font-semibold'
                : 'text-[var(--ash)] hover:text-white hover:bg-[var(--ink)]'
            }`}
          >
            <span>Danh Mục ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'settings'
                ? 'bg-[var(--steel)] text-white font-semibold'
                : 'text-[var(--ash)] hover:text-white hover:bg-[var(--ink)]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Cài Đặt Menu</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'sync'
                ? 'bg-[var(--steel)] text-white font-semibold'
                : 'text-[var(--ash)] hover:text-white hover:bg-[var(--ink)]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Đồng Bộ Discord</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'audit'
                ? 'bg-[var(--steel)] text-white font-semibold'
                : 'text-[var(--ash)] hover:text-white hover:bg-[var(--ink)]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Logs</span>
          </button>
        </div>

        {/* Tab 1: Products */}
        {activeTab === 'products' && (
          <div className="rounded-2xl bg-[var(--ink)] border border-[var(--line)] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--graphite)] text-[var(--ash)] uppercase tracking-wider text-[10px] border-b border-[var(--line)]">
                  <tr>
                    <th className="px-4 py-3">Sản phẩm</th>
                    <th className="px-4 py-3">Danh mục</th>
                    <th className="px-4 py-3">Giá bán</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Version</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[var(--graphite)]/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">
                        <div className="flex items-center space-x-2">
                          <span>{p.discord_select_emoji_name || '📦'}</span>
                          <div>
                            <div>{p.name}</div>
                            <div className="text-[10px] text-[var(--ash)] font-mono">{p.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-2)]">{p.category_name || '-'}</td>
                      <td className="px-4 py-3 font-semibold text-white">
                        {formatBrandMoney(p.price_amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            p.status === 'ACTIVE'
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                              : p.status === 'SOLD_OUT'
                              ? 'bg-red-950/60 text-red-300 border border-red-800/40'
                              : 'bg-[var(--graphite)] text-[var(--ash)] border border-[var(--line)]'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[var(--ash)]">v{p.version}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Link
                          href={`/admin/menu/products/${p.id}`}
                          className="p-1.5 rounded bg-[var(--graphite)] hover:bg-[var(--steel)] text-white inline-block transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        {p.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => handleArchiveProduct(p.id, p.name, p.version)}
                            className="p-1.5 rounded bg-[var(--graphite)] hover:bg-red-900/50 text-red-400 inline-block transition-colors"
                            title="Lưu trữ (Archive)"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Categories */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <form onSubmit={handleCreateCategory} className="p-5 rounded-2xl bg-[var(--ink)] border border-[var(--line)] flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Tên danh mục</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="VD: Gaming Accounts"
                  className="px-3 py-2 rounded-xl bg-[var(--graphite)] border border-[var(--line)] text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Emoji</label>
                <input
                  type="text"
                  value={newCatEmoji}
                  onChange={(e) => setNewCatEmoji(e.target.value)}
                  className="w-20 px-3 py-2 rounded-xl bg-[var(--graphite)] border border-[var(--line)] text-xs text-white text-center"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[var(--off-white)] text-[var(--void)] text-xs font-semibold hover:bg-[var(--white)]"
              >
                Tạo Danh Mục
              </button>
            </form>

            <div className="rounded-2xl bg-[var(--ink)] border border-[var(--line)] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--graphite)] text-[var(--ash)] uppercase tracking-wider text-[10px] border-b border-[var(--line)]">
                  <tr>
                    <th className="px-4 py-3">Danh mục</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3 font-medium text-white flex items-center space-x-2">
                        <span>{c.emoji || '📦'}</span>
                        <span>{c.name}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[var(--ash)]">{c.slug}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--graphite)] text-[var(--ash)] border border-[var(--line)]">
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {c.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => handleArchiveCategory(c.id, c.name)}
                            className="p-1.5 rounded bg-[var(--graphite)] hover:bg-red-900/50 text-red-400 transition-colors"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Settings with Live Discord Preview (§8) */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form onSubmit={handleSaveSettings} className="lg:col-span-7 p-5 rounded-2xl bg-[var(--ink)] border border-[var(--line)] space-y-4">
              <h2 className="text-xs font-semibold text-[var(--silver-accent)] uppercase tracking-wider">
                Cài Đặt Cửa Hàng & Discord Description
              </h2>

              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Tên cửa hàng</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--graphite)] border border-[var(--line)] text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--graphite)] border border-[var(--line)] text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">
                  Discord Menu Description (§S14: hỗ trợ token &#123;&#123;tos&#125;&#125;, &#123;&#123;rules&#125;&#125;, &#123;&#123;support&#125;&#125;)
                </label>
                <textarea
                  rows={8}
                  value={descTemplate}
                  onChange={(e) => setDescTemplate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--graphite)] border border-[var(--line)] text-xs text-white leading-relaxed font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-2)] mb-1">TOS URL (https:)</label>
                  <input
                    type="url"
                    value={tosUrl}
                    onChange={(e) => setTosUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--graphite)] border border-[var(--line)] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Rules URL (https:)</label>
                  <input
                    type="url"
                    value={rulesUrl}
                    onChange={(e) => setRulesUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--graphite)] border border-[var(--line)] text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Support URL (https:)</label>
                  <input
                    type="url"
                    value={supportUrl}
                    onChange={(e) => setSupportUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--graphite)] border border-[var(--line)] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Discord Invite URL (https:)</label>
                  <input
                    type="url"
                    value={discordInviteUrl}
                    onChange={(e) => setDiscordInviteUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--graphite)] border border-[var(--line)] text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[var(--off-white)] text-[var(--void)] text-xs font-semibold hover:bg-[var(--white)] shadow-sm"
              >
                Lưu Cài Đặt
              </button>
            </form>

            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider font-display">
                Live Discord Embed Preview
              </div>
              <DiscordComponents
                payload={renderDiscordMenuPayload({
                  store_name: storeName || 'Pade Store',
                  menu_description: descTemplate,
                  products: products.slice(0, 3),
                })}
              />
            </div>
          </div>
        )}

        {/* Tab 4: Sync & Realtime Status (§8, §S9) */}
        {activeTab === 'sync' && (
          <div className="p-6 rounded-2xl bg-[var(--ink)] border border-[var(--line)] space-y-6">
            <h2 className="text-xs font-semibold text-[var(--silver-accent)] uppercase tracking-wider">
              Trạng Thái Đồng Bộ (Website & Discord Bot)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[var(--graphite)] border border-[var(--line)]">
                <div className="text-[11px] text-[var(--ash)] mb-1">Website Catalog</div>
                <div className="text-sm font-bold text-emerald-400 flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>Đồng bộ (v{syncOverview?.currentVersion || 1})</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--graphite)] border border-[var(--line)]">
                <div className="text-[11px] text-[var(--ash)] mb-1">Discord #menu</div>
                <div className="text-sm font-bold flex items-center space-x-1.5">
                  <span
                    className={
                      syncOverview?.discordStatus === 'SYNCED'
                        ? 'text-emerald-400'
                        : syncOverview?.discordStatus === 'UPDATING'
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }
                  >
                    ● {syncOverview?.discordStatus || 'SYNCED'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--graphite)] border border-[var(--line)]">
                <div className="text-[11px] text-[var(--ash)] mb-1">Discord Bot Runtime</div>
                <div className="text-sm font-bold flex items-center space-x-1.5">
                  <span className={syncOverview?.botOnline ? 'text-emerald-400' : 'text-amber-400'}>
                    {syncOverview?.botOnline ? '✓ Online' : 'Pending Sync (Bot offline)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleTriggerSync}
                disabled={syncing}
                className="px-4 py-2 rounded-xl bg-[var(--off-white)] text-[var(--void)] text-xs font-semibold hover:bg-[var(--white)] shadow-sm disabled:opacity-50"
              >
                {syncing ? 'Đang gửi yêu cầu...' : 'Kích Hoạt Sync Discord'}
              </button>

              {syncOverview?.deadEventsCount > 0 && (
                <button
                  onClick={handleRetryDeadOutbox}
                  className="px-4 py-2 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-semibold hover:bg-red-900/60"
                >
                  Thử lại {syncOverview.deadEventsCount} sự kiện DEAD
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Audit Logs (§8) */}
        {activeTab === 'audit' && (
          <div className="rounded-2xl bg-[var(--ink)] border border-[var(--line)] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--graphite)] text-[var(--ash)] uppercase tracking-wider text-[10px] border-b border-[var(--line)]">
                <tr>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Actor / Nguồn</th>
                  <th className="px-4 py-3">Hành động</th>
                  <th className="px-4 py-3">Version</th>
                  <th className="px-4 py-3">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--graphite)]/50">
                    <td className="px-4 py-3 font-mono text-[var(--ash)]">
                      {new Date(log.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-white">{log.actor_id}</span>
                      <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-[var(--steel)] text-[var(--silver-dim)]">
                        {log.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{log.action}</td>
                    <td className="px-4 py-3 font-mono text-[var(--ash)]">v{log.menu_version}</td>
                    <td className="px-4 py-3 text-[11px] text-[var(--ash)] font-mono max-w-xs truncate">
                      {log.after_json ? JSON.stringify(log.after_json) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
