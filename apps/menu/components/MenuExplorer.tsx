'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { MenuCategory, MenuProduct } from '../lib/types';
import { ProductCard } from './ProductCard';
import { QuickPreviewModal } from './QuickPreviewModal';
import { foldVietnamese } from '../lib/domain/text';
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  Tag,
  CheckCircle2,
  X,
  PackageSearch,
} from 'lucide-react';

interface MenuExplorerProps {
  categories: MenuCategory[];
  products: MenuProduct[];
  discordUrl?: string;
  initialProductSlug?: string;
}

type QuickFilter = 'all' | 'sale' | 'available' | 'featured';

const QUICK_FILTERS: Array<{
  key: Exclude<QuickFilter, 'all'>;
  label: string;
  icon: typeof Sparkles;
}> = [
  { key: 'featured', label: 'Nổi bật', icon: Sparkles },
  { key: 'sale', label: 'Đang giảm giá', icon: Tag },
  { key: 'available', label: 'Còn hàng', icon: CheckCircle2 },
];

export function MenuExplorer({
  categories,
  products,
  discordUrl = 'https://discord.gg/pade',
  initialProductSlug,
}: MenuExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<QuickFilter>('all');
  const [previewProduct, setPreviewProduct] = useState<MenuProduct | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(36);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Ctrl/Cmd+K focuses search (makes the on-screen hint truthful)
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  // Check URL query param for ?product=<slug> on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const slug = initialProductSlug || url.searchParams.get('product');
    if (slug) {
      const match = products.find((p) => p.slug === slug);
      if (match) {
        setPreviewProduct(match);
      }
    }
  }, [products, initialProductSlug]);

  // Pre-index search tokens for fast accent-folded client search (§ADR-005)
  const indexedProducts = useMemo(() => {
    return products.map((p) => ({
      product: p,
      searchVector: foldVietnamese(`${p.name} ${p.sku} ${p.category_name || ''} ${p.short_description || ''}`),
    }));
  }, [products]);

  // Category counts (memoised once per catalog change)
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      const key = p.category_id ?? '';
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return counts;
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    const foldedQuery = foldVietnamese(searchQuery);

    return indexedProducts
      .filter(({ product, searchVector }) => {
        // Category filter
        if (selectedCategory !== 'all' && product.category_id !== selectedCategory) {
          return false;
        }

        // Special chip filter
        if (activeFilter === 'sale') {
          const price = Number(product.price_amount);
          const compare = Number(product.compare_at_price || 0);
          if (compare <= price) return false;
        } else if (activeFilter === 'featured') {
          if (!product.is_featured) return false;
        } else if (activeFilter === 'available') {
          if (product.status === 'SOLD_OUT' || (product.stock_mode === 'TRACKED' && product.stock_quantity <= 0)) {
            return false;
          }
        }

        // Accent-insensitive search
        if (foldedQuery) {
          if (!searchVector.includes(foldedQuery)) {
            return false;
          }
        }

        return true;
      })
      .map(({ product }) => product);
  }, [indexedProducts, selectedCategory, activeFilter, searchQuery]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasActiveFilters =
    selectedCategory !== 'all' || activeFilter !== 'all' || searchQuery.trim().length > 0;

  const resetFilters = () => {
    setSelectedCategory('all');
    setActiveFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* ============ Control deck ============ */}
      <div className="relative pade-panel rounded-2xl p-4 sm:p-5 shadow-[var(--shadow-deep)]">
        <span className="pointer-events-none absolute top-0 inset-x-10 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.18)] to-transparent" />

        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--ash)]">
              <Search className="w-4 h-4" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm sản phẩm theo tên, SKU hoặc gói..."
              aria-label="Tìm sản phẩm"
              className="pade-input w-full pl-10 pr-16 py-3 rounded-xl text-sm"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 my-1.5 flex items-center text-[11px] text-[var(--ash)] hover:text-[var(--white)] px-2 rounded-lg hover:bg-[var(--graphite)] transition-colors"
                aria-label="Xóa tìm kiếm"
              >
                Xóa
              </button>
            ) : (
              <span className="absolute inset-y-0 right-0 pr-3.5 hidden sm:flex items-center text-[10px] pade-mono text-[var(--silver-deep)] pointer-events-none">
                ⌘K
              </span>
            )}
          </div>

          {/* Categories */}
          <div className="relative">
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none pade-mask-fade-x justify-start md:justify-center">
              <button
                onClick={() => setSelectedCategory('all')}
                aria-pressed={selectedCategory === 'all'}
                className={`pade-chip px-3.5 py-1.5 text-xs ${
                  selectedCategory === 'all' ? 'pade-chip--active' : ''
                }`}
              >
                <span>Tất cả</span>
                <span className="text-[10px] opacity-60">({products.length})</span>
              </button>

              {categories.map((cat) => {
                const count = categoryCounts.get(cat.id) || 0;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    aria-pressed={isActive}
                    className={`pade-chip px-3.5 py-1.5 text-xs ${isActive ? 'pade-chip--active' : ''}`}
                  >
                    {cat.emoji && <span>{cat.emoji}</span>}
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick filters + result meta */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[var(--line-soft)]">
            <div className="flex items-center gap-2 text-xs flex-wrap justify-center">
              <span className="hidden sm:inline-flex items-center gap-1 text-[var(--ash)] mr-1">
                <SlidersHorizontal className="w-3 h-3" />
              </span>
              {QUICK_FILTERS.map(({ key, label, icon: Icon }) => {
                const isActive = activeFilter === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveFilter(isActive ? 'all' : key)}
                    aria-pressed={isActive}
                    className={`pade-chip px-3 py-1.5 ${isActive ? 'pade-chip--active' : ''}`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{label}</span>
                  </button>
                );
              })}

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] text-[var(--ash)] hover:text-[var(--white)] hover:bg-[var(--graphite)] transition-colors"
                >
                  <X className="w-3 h-3" />
                  <span>Đặt lại</span>
                </button>
              )}
            </div>

            <div className="text-[11px] text-[var(--ash)] pade-mono whitespace-nowrap">
              <span className="text-[var(--silver-accent)] font-semibold">{filteredProducts.length}</span>
              <span className="mx-1">/</span>
              <span>{products.length}</span>
              <span className="ml-2 tracking-wider uppercase text-[10px]">items</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============ Product grid (§6: 1→2→3→4 cols) ============ */}
      {displayedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {displayedProducts.map((product) => (
            <div key={product.id} className="[content-visibility:auto]">
              <ProductCard
                product={product}
                onQuickPreview={(p) => setPreviewProduct(p)}
              />
            </div>
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="relative pade-panel rounded-2xl max-w-lg mx-auto text-center py-16 px-6 overflow-hidden">
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_0%,rgba(208,211,217,0.10),transparent_70%)]" />
          <div className="relative">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[var(--graphite)] border border-[var(--line)] flex items-center justify-center">
              <PackageSearch className="w-6 h-6 text-[var(--silver-dim)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--white)] mb-1.5 font-display">
              Không tìm thấy sản phẩm
            </h3>
            <p className="text-xs text-[var(--ash)] font-light mb-5 leading-relaxed">
              Thử từ khóa khác, hoặc xóa bộ lọc để xem toàn bộ menu.
            </p>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="pade-btn pade-btn-ghost px-4 py-2 text-xs">
                <X className="w-3.5 h-3.5" />
                <span>Xóa bộ lọc</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Progressive load more */}
      {displayedProducts.length < filteredProducts.length && (
        <div className="text-center pt-2">
          <button
            onClick={() => setVisibleCount((prev) => prev + 36)}
            className="pade-btn pade-btn-ghost px-6 py-2.5 text-xs"
          >
            Xem thêm sản phẩm
            <span className="text-[10px] text-[var(--ash)] pade-mono">
              +{filteredProducts.length - displayedProducts.length}
            </span>
          </button>
        </div>
      )}

      {/* Quick Preview Modal Island */}
      <QuickPreviewModal
        product={previewProduct}
        onClose={() => setPreviewProduct(null)}
        discordUrl={discordUrl}
      />
    </div>
  );
}
