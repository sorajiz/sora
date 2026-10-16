'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { MenuCategory, MenuProduct } from '../lib/types';
import { ProductCard } from './ProductCard';
import { QuickPreviewModal } from './QuickPreviewModal';
import { foldVietnamese } from '../lib/domain/text';
import { Search, Sparkles, SlidersHorizontal, Tag, CheckCircle2 } from 'lucide-react';

interface MenuExplorerProps {
  categories: MenuCategory[];
  products: MenuProduct[];
  discordUrl?: string;
  initialProductSlug?: string;
}

export function MenuExplorer({
  categories,
  products,
  discordUrl = 'https://discord.gg/pade',
  initialProductSlug,
}: MenuExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'sale' | 'available' | 'featured'>('all');
  const [previewProduct, setPreviewProduct] = useState<MenuProduct | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(36);

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

  return (
    <div className="space-y-8">
      {/* Search & Filter Header Bar */}
      <div className="space-y-4">
        {/* Search Input Bar */}
        <div className="relative max-w-xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--ash)]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm sản phẩm theo tên, SKU hoặc gói..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--ink)] border border-[var(--line)] text-sm text-[var(--white)] placeholder-[var(--ash)] focus:outline-none focus:border-[var(--silver-dim)] transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-[var(--ash)] hover:text-[var(--white)]"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Categories Horizontal Scrolling Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
              selectedCategory === 'all'
                ? 'bg-[var(--off-white)] text-[var(--void)] border-[var(--white)] font-semibold shadow-sm'
                : 'bg-[var(--ink)] text-[var(--text-2)] border-[var(--line)] hover:text-[var(--white)] hover:bg-[var(--graphite)]'
            }`}
          >
            Tất cả ({products.length})
          </button>

          {categories.map((cat) => {
            const count = products.filter((p) => p.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border flex items-center space-x-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-[var(--off-white)] text-[var(--void)] border-[var(--white)] font-semibold shadow-sm'
                    : 'bg-[var(--ink)] text-[var(--text-2)] border-[var(--line)] hover:text-[var(--white)] hover:bg-[var(--graphite)]'
                }`}
              >
                {cat.emoji && <span>{cat.emoji}</span>}
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Quick Filter Tags (Sale, Available, Featured) */}
        <div className="flex items-center justify-center space-x-2 pt-1 text-xs">
          <button
            onClick={() => setActiveFilter(activeFilter === 'featured' ? 'all' : 'featured')}
            className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg border transition-all ${
              activeFilter === 'featured'
                ? 'bg-[var(--steel)] text-[var(--white)] border-[var(--silver-dim)]'
                : 'bg-[var(--ink)] text-[var(--ash)] border-[var(--line)] hover:text-[var(--white)]'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Nổi bật</span>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'sale' ? 'all' : 'sale')}
            className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg border transition-all ${
              activeFilter === 'sale'
                ? 'bg-[var(--steel)] text-[var(--white)] border-[var(--silver-dim)]'
                : 'bg-[var(--ink)] text-[var(--ash)] border-[var(--line)] hover:text-[var(--white)]'
            }`}
          >
            <Tag className="w-3 h-3" />
            <span>Đang giảm giá</span>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'available' ? 'all' : 'available')}
            className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg border transition-all ${
              activeFilter === 'available'
                ? 'bg-[var(--steel)] text-[var(--white)] border-[var(--silver-dim)]'
                : 'bg-[var(--ink)] text-[var(--ash)] border-[var(--line)] hover:text-[var(--white)]'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Còn hàng</span>
          </button>
        </div>
      </div>

      {/* Product Catalog Grid (§6: desktop 3-4 cols, tablet 2-3 cols, mobile 1-2 cols) */}
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
        /* Empty State */
        <div className="text-center py-20 px-4 rounded-2xl bg-[var(--ink)] border border-[var(--line)] max-w-lg mx-auto">
          <span className="text-4xl block mb-3">𐙚</span>
          <h3 className="text-base font-semibold text-[var(--white)] mb-1 font-display">
            PADE STORE · the menu is being prepared 𐙚
          </h3>
          <p className="text-xs text-[var(--ash)] font-light">
            Không tìm thấy sản phẩm phù hợp. Vui lòng thử tìm kiếm khác hoặc quay lại sau.
          </p>
        </div>
      )}

      {/* Progressive Load More ("Xem thêm") */}
      {displayedProducts.length < filteredProducts.length && (
        <div className="text-center pt-4">
          <button
            onClick={() => setVisibleCount((prev) => prev + 36)}
            className="px-6 py-2.5 rounded-xl bg-[var(--ink)] hover:bg-[var(--graphite)] text-[var(--white)] text-xs font-semibold border border-[var(--line)] transition-all shadow-sm"
          >
            Xem thêm sản phẩm ({filteredProducts.length - displayedProducts.length} còn lại)
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
