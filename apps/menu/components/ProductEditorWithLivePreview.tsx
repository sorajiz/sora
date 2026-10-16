'use client';

import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MenuCategory, MenuProduct } from '../lib/types';
import { ProductCard } from './ProductCard';
import { DiscordComponents } from './DiscordComponents';
import { renderDiscordMenuPayload } from '../lib/render/discord-payload';
import { CharacterPalette } from './CharacterPalette';
import { countGraphemes } from '../lib/domain/text';
import { formatBrandMoney } from '../lib/domain/money';
import {
  ArrowLeft,
  Save,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Monitor,
  MessageSquare,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface ProductEditorProps {
  initialProduct?: Partial<MenuProduct>;
  isNew?: boolean;
}

export function ProductEditorWithLivePreview({
  initialProduct = {},
  isNew = false,
}: ProductEditorProps) {
  const router = useRouter();

  // Form State
  const [name, setName] = useState(initialProduct.name || '');
  const [sku, setSku] = useState(initialProduct.sku || '');
  const [slug, setSlug] = useState(initialProduct.slug || '');
  const [price, setPrice] = useState<number | string>(initialProduct.price_amount || 0);
  const [comparePrice, setComparePrice] = useState<number | string>(initialProduct.compare_at_price || '');
  const [categoryId, setCategoryId] = useState(initialProduct.category_id || '');
  const [shortDesc, setShortDesc] = useState(initialProduct.short_description || '');
  const [desc, setDesc] = useState(initialProduct.description || '');
  const [status, setStatus] = useState<string>(initialProduct.status || 'ACTIVE');
  const [stockMode, setStockMode] = useState<string>(initialProduct.stock_mode || 'UNLIMITED');
  const [stockQuantity, setStockQuantity] = useState<number>(initialProduct.stock_quantity || 0);
  const [isFeatured, setIsFeatured] = useState<boolean>(initialProduct.is_featured || false);
  const [discordLabel, setDiscordLabel] = useState(initialProduct.discord_select_label || '');
  const [discordDesc, setDiscordDesc] = useState(initialProduct.discord_select_description || '');
  const [emojiName, setEmojiName] = useState(initialProduct.discord_select_emoji_name || '📦');
  const [emojiId, setEmojiId] = useState(initialProduct.discord_select_emoji_id || '');
  const [emojiAnimated, setEmojiAnimated] = useState(initialProduct.discord_select_emoji_animated || false);
  const [imageUrl, setImageUrl] = useState(initialProduct.primary_image || '');

  // Optimistic version tracking
  const [version, setVersion] = useState<number>(initialProduct.version || 1);
  const [conflictProduct, setConflictProduct] = useState<MenuProduct | null>(null);

  // UI state
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [previewTab, setPreviewTab] = useState<'website' | 'discord' | 'mobile'>('website');
  const [saveState, setSaveState] = useState<'unsaved' | 'saving' | 'saved' | 'conflict' | 'error'>('saved');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Load categories
  useEffect(() => {
    fetch('/api/admin/menu/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
          if (!categoryId && data.categories.length > 0) {
            setCategoryId(data.categories[0].id);
          }
        }
      })
      .catch(() => {});
  }, [categoryId]);

  const markDirty = () => {
    setIsDirty(true);
    setSaveState('unsaved');
  };

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Grapheme counters for Discord fields (§8)
  const labelGraphemes = countGraphemes(discordLabel || name);
  const descGraphemes = countGraphemes(discordDesc || shortDesc);

  // Deferred values for responsive typing (§8)
  const deferredName = useDeferredValue(name);
  const deferredPrice = useDeferredValue(price);
  const deferredShortDesc = useDeferredValue(shortDesc);

  const previewProductModel: MenuProduct = useMemo(() => {
    const cat = categories.find((c) => c.id === categoryId);
    return {
      id: initialProduct.id || 'preview-id',
      sku: sku || 'PREVIEW-SKU',
      slug: slug || 'preview-slug',
      name: deferredName || 'Tên sản phẩm',
      short_description: deferredShortDesc,
      description: desc,
      category_id: categoryId,
      category_name: cat?.name || 'Danh mục',
      price_amount: deferredPrice || 0,
      currency: 'VND',
      compare_at_price: comparePrice || null,
      stock_mode: stockMode as any,
      stock_quantity: stockQuantity,
      status: status as any,
      is_featured: isFeatured,
      is_available: status !== 'SOLD_OUT',
      sort_order: 1,
      discord_select_label: discordLabel || deferredName,
      discord_select_description: discordDesc || deferredShortDesc,
      discord_select_emoji_name: emojiName,
      discord_select_emoji_id: emojiId || null,
      discord_select_emoji_animated: emojiAnimated,
      primary_image: imageUrl || null,
      version,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }, [
    initialProduct.id,
    sku,
    slug,
    deferredName,
    deferredShortDesc,
    desc,
    categoryId,
    categories,
    deferredPrice,
    comparePrice,
    stockMode,
    stockQuantity,
    status,
    isFeatured,
    discordLabel,
    discordDesc,
    emojiName,
    emojiId,
    emojiAnimated,
    imageUrl,
    version,
  ]);

  const discordPayload = useMemo(() => {
    return renderDiscordMenuPayload({
      store_name: 'Pade Store',
      products: [previewProductModel],
    });
  }, [previewProductModel]);

  const handleSave = async () => {
    setSaveState('saving');
    setErrorMessage('');
    setConflictProduct(null);

    const payload = {
      name,
      sku: sku.trim().toUpperCase(),
      slug: slug || sku.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      short_description: shortDesc,
      description: desc,
      category_id: categoryId || null,
      price_amount: price,
      compare_at_price: comparePrice ? comparePrice : null,
      stock_mode: stockMode,
      stock_quantity: Number(stockQuantity),
      status,
      is_featured: isFeatured,
      discord_select_label: discordLabel || name,
      discord_select_description: discordDesc || shortDesc,
      discord_select_emoji_name: emojiName,
      discord_select_emoji_id: emojiId || null,
      discord_select_emoji_animated: emojiAnimated,
      expected_version: version,
    };

    try {
      const url = isNew
        ? '/api/admin/menu/products'
        : `/api/admin/menu/products/${initialProduct.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        const conflictData = await res.json();
        setSaveState('conflict');
        setConflictProduct(conflictData.currentProduct);
        setErrorMessage('Sản phẩm đã được cập nhật ở nơi khác.');
        return;
      }

      if (!res.ok) {
        const errData = await res.json();
        setSaveState('error');
        setErrorMessage(errData.error || 'Lỗi khi lưu sản phẩm');
        return;
      }

      const resData = await res.json();
      setSaveState('saved');
      setIsDirty(false);
      setVersion(resData.product.version);

      if (isNew) {
        router.push(`/admin/menu/products/${resData.product.id}`);
      }
    } catch (err: any) {
      setSaveState('error');
      setErrorMessage(err.message || 'Lỗi kết nối mạng');
    }
  };

  const handleLoadLatest = () => {
    if (!conflictProduct) return;
    setName(conflictProduct.name);
    setPrice(conflictProduct.price_amount);
    setComparePrice(conflictProduct.compare_at_price || '');
    setShortDesc(conflictProduct.short_description || '');
    setDesc(conflictProduct.description || '');
    setStatus(conflictProduct.status);
    setStockMode(conflictProduct.stock_mode);
    setStockQuantity(conflictProduct.stock_quantity);
    setVersion(conflictProduct.version);
    setConflictProduct(null);
    setSaveState('saved');
    setIsDirty(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--void)] text-[var(--off-white)]">
      {/* Editor Top Bar */}
      <header className="sticky top-0 z-40 bg-[var(--ink)]/95 border-b border-[var(--line)] backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/menu"
            className="p-1.5 rounded-lg text-[var(--ash)] hover:text-white hover:bg-[var(--graphite)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-white font-display">
              {isNew ? 'Thêm Sản Phẩm Mới' : `Chỉnh Sửa: ${name || sku}`}
            </h1>
            <div className="flex items-center space-x-2 text-[11px] text-[var(--ash)]">
              <span>Phiên bản v{version}</span>
              <span>·</span>
              <span
                className={`font-medium ${
                  saveState === 'saved'
                    ? 'text-emerald-400'
                    : saveState === 'saving'
                    ? 'text-amber-400'
                    : saveState === 'conflict'
                    ? 'text-red-400 font-bold'
                    : 'text-[var(--silver-dim)]'
                }`}
              >
                {saveState === 'saved' && '✓ Đã lưu'}
                {saveState === 'saving' && 'Đang lưu...'}
                {saveState === 'unsaved' && '● Chưa lưu'}
                {saveState === 'conflict' && 'Xung đột phiên bản'}
                {saveState === 'error' && 'Lỗi lưu dữ liệu'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleSave}
            disabled={saveState === 'saving'}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[var(--off-white)] text-[var(--void)] text-xs font-semibold hover:bg-[var(--white)] active:scale-95 transition-all shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu Thay Đổi</span>
          </button>
        </div>
      </header>

      {/* Optimistic Concurrency Conflict Banner (§8) */}
      {conflictProduct && (
        <div className="bg-red-950/60 border-b border-red-800/60 px-6 py-3 flex items-center justify-between text-xs text-red-200 animate-fade-in">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              Sản phẩm này đã được chỉnh sửa ở nơi khác (v{version} → v{conflictProduct.version}).
            </span>
          </div>
          <button
            onClick={handleLoadLatest}
            className="px-3 py-1 rounded bg-red-800 hover:bg-red-700 text-white font-medium"
          >
            Tải Bản Mới Nhất
          </button>
        </div>
      )}

      {/* Main Two-Pane Container (§8) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Pane */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-2xl bg-[var(--ink)] border border-[var(--line)] space-y-4">
            <h2 className="text-xs font-semibold text-[var(--silver-accent)] uppercase tracking-wider">
              Thông Tin Cơ Bản
            </h2>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-[var(--text-2)]">Tên sản phẩm *</label>
                <CharacterPalette onInsert={(c) => { setName((p) => p + c); markDirty(); }} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); markDirty(); }}
                placeholder="VD: Nitro Boosts 1 Tháng"
                className="w-full px-3 py-2 rounded-xl bg-[var(--graphite)] border border-[var(--line)] text-xs text-white focus:outline-none focus:border-[var(--silver-dim)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">SKU *</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => { setSku(e.target.value.toUpperCase()); markDirty(); }}
                  placeholder="NITRO-1M"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--graphite)] border border-[var(--line)] text-xs font-mono text-white focus:outline-none focus:border-[var(--silver-dim)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Danh mục</label>
                <select
                  value={categoryId}
                  onChange={(e) => { setCategoryId(e.target.value); markDirty(); }}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--graphite)] border border-[var(--line)] text-xs text-white focus:outline-none focus:border-[var(--silver-dim)]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Giá bán (VND) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => { setPrice(e.target.value); markDirty(); }}
                  placeholder="90000"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--graphite)] border border-[var(--line)] text-xs text-white focus:outline-none focus:border-[var(--silver-dim)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Giá so sánh (Sale)</label>
                <input
                  type="number"
                  value={comparePrice}
                  onChange={(e) => { setComparePrice(e.target.value); markDirty(); }}
                  placeholder="120000"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--graphite)] border border-[var(--line)] text-xs text-white focus:outline-none focus:border-[var(--silver-dim)]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-[var(--text-2)]">Mô tả ngắn</label>
                <CharacterPalette onInsert={(c) => { setShortDesc((p) => p + c); markDirty(); }} />
              </div>
              <input
                type="text"
                value={shortDesc}
                onChange={(e) => { setShortDesc(e.target.value); markDirty(); }}
                placeholder="Gói bảo hành trọn đời, kích hoạt ngay"
                className="w-full px-3 py-2 rounded-xl bg-[var(--graphite)] border border-[var(--line)] text-xs text-white focus:outline-none focus:border-[var(--silver-dim)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Mô tả chi tiết</label>
              <textarea
                rows={4}
                value={desc}
                onChange={(e) => { setDesc(e.target.value); markDirty(); }}
                placeholder="Nội dung chi tiết & bảo hành..."
                className="w-full px-3 py-2 rounded-xl bg-[var(--graphite)] border border-[var(--line)] text-xs text-white focus:outline-none focus:border-[var(--silver-dim)] leading-relaxed"
              />
            </div>
          </div>

          {/* Discord Specific Settings & Limits (§8) */}
          <div className="p-5 rounded-2xl bg-[var(--ink)] border border-[var(--line)] space-y-4">
            <h2 className="text-xs font-semibold text-[var(--silver-accent)] uppercase tracking-wider">
              Discord Menu & Emoji
            </h2>

            <div>
              <div className="flex items-center justify-between mb-1 text-xs">
                <label className="font-medium text-[var(--text-2)]">Discord Select Label</label>
                <span className={`text-[10px] ${labelGraphemes > 100 ? 'text-red-400 font-bold' : 'text-[var(--ash)]'}`}>
                  {labelGraphemes}/100 ký tự
                </span>
              </div>
              <input
                type="text"
                value={discordLabel}
                onChange={(e) => { setDiscordLabel(e.target.value); markDirty(); }}
                placeholder={name || 'Tên hiển thị trong select menu'}
                className="w-full px-3 py-2 rounded-xl bg-[var(--graphite)] border border-[var(--line)] text-xs text-white focus:outline-none focus:border-[var(--silver-dim)]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1 text-xs">
                <label className="font-medium text-[var(--text-2)]">Discord Select Description</label>
                <span className={`text-[10px] ${descGraphemes > 100 ? 'text-red-400 font-bold' : 'text-[var(--ash)]'}`}>
                  {descGraphemes}/100 ký tự
                </span>
              </div>
              <input
                type="text"
                value={discordDesc}
                onChange={(e) => { setDiscordDesc(e.target.value); markDirty(); }}
                placeholder={shortDesc || 'Mô tả ngắn kèm giá'}
                className="w-full px-3 py-2 rounded-xl bg-[var(--graphite)] border border-[var(--line)] text-xs text-white focus:outline-none focus:border-[var(--silver-dim)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Emoji Name / Glyph</label>
                <input
                  type="text"
                  value={emojiName}
                  onChange={(e) => { setEmojiName(e.target.value); markDirty(); }}
                  placeholder="📦 hoặc nicho"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--graphite)] border border-[var(--line)] text-xs text-white focus:outline-none focus:border-[var(--silver-dim)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Discord Emoji ID (Nếu custom)</label>
                <input
                  type="text"
                  value={emojiId}
                  onChange={(e) => { setEmojiId(e.target.value); markDirty(); }}
                  placeholder="1498671634524016792"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--graphite)] border border-[var(--line)] text-xs font-mono text-white focus:outline-none focus:border-[var(--silver-dim)]"
                />
              </div>
            </div>
          </div>

          {/* Status & Inventory */}
          <div className="p-5 rounded-2xl bg-[var(--ink)] border border-[var(--line)] space-y-4">
            <h2 className="text-xs font-semibold text-[var(--silver-accent)] uppercase tracking-wider">
              Trạng Thái & Kho Hàng
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Trạng thái hiển thị</label>
                <select
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); markDirty(); }}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--graphite)] border border-[var(--line)] text-xs text-white focus:outline-none focus:border-[var(--silver-dim)]"
                >
                  <option value="ACTIVE">ACTIVE (Hiển thị & Bán)</option>
                  <option value="SOLD_OUT">SOLD_OUT (Hết hàng)</option>
                  <option value="DRAFT">DRAFT (Bản nháp)</option>
                  <option value="HIDDEN">HIDDEN (Ẩn)</option>
                  <option value="ARCHIVED">ARCHIVED (Lưu trữ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Chế độ kho (Stock Mode)</label>
                <select
                  value={stockMode}
                  onChange={(e) => { setStockMode(e.target.value); markDirty(); }}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--graphite)] border border-[var(--line)] text-xs text-white focus:outline-none focus:border-[var(--silver-dim)]"
                >
                  <option value="UNLIMITED">UNLIMITED (Không giới hạn)</option>
                  <option value="TRACKED">TRACKED (Theo dõi số lượng)</option>
                  <option value="MANUAL">MANUAL (Thủ công)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="isFeaturedCheck"
                checked={isFeatured}
                onChange={(e) => { setIsFeatured(e.target.checked); markDirty(); }}
                className="rounded border-[var(--line)] bg-[var(--graphite)] text-[var(--silver-dim)]"
              />
              <label htmlFor="isFeaturedCheck" className="text-xs text-[var(--text-2)] cursor-pointer">
                Đánh dấu là sản phẩm nổi bật (Featured / HOT ✦)
              </label>
            </div>
          </div>
        </div>

        {/* Right Sticky Live Preview Pane (§8, §9) */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-display">
                  Live Preview
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>

              {/* Preview Tabs: Website, Discord, Mobile (§8) */}
              <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-[var(--ink)] border border-[var(--line)] text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewTab('website')}
                  className={`px-2.5 py-1 rounded flex items-center space-x-1 transition-all ${
                    previewTab === 'website'
                      ? 'bg-[var(--steel)] text-white font-medium'
                      : 'text-[var(--ash)] hover:text-white'
                  }`}
                >
                  <Monitor className="w-3 h-3" />
                  <span>Web</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewTab('discord')}
                  className={`px-2.5 py-1 rounded flex items-center space-x-1 transition-all ${
                    previewTab === 'discord'
                      ? 'bg-[var(--steel)] text-white font-medium'
                      : 'text-[var(--ash)] hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Discord</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewTab('mobile')}
                  className={`px-2.5 py-1 rounded flex items-center space-x-1 transition-all ${
                    previewTab === 'mobile'
                      ? 'bg-[var(--steel)] text-white font-medium'
                      : 'text-[var(--ash)] hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Preview Canvas */}
            <div className="p-4 rounded-2xl bg-[var(--ink)] border border-[var(--line)] min-h-[380px] flex items-center justify-center">
              {previewTab === 'website' && (
                <div className="w-full max-w-sm">
                  <ProductCard product={previewProductModel} onQuickPreview={() => {}} />
                </div>
              )}

              {previewTab === 'discord' && (
                <div className="w-full">
                  <DiscordComponents payload={discordPayload} />
                </div>
              )}

              {previewTab === 'mobile' && (
                <div className="w-[390px] max-w-full p-3 rounded-2xl bg-[var(--void)] border-2 border-[var(--steel)] shadow-2xl">
                  <div className="text-[10px] text-center text-[var(--ash)] mb-2 font-mono">
                    390px Mobile Viewport
                  </div>
                  <ProductCard product={previewProductModel} onQuickPreview={() => {}} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
