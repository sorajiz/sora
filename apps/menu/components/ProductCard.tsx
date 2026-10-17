'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { MenuProduct } from '../lib/types';
import { formatBrandMoney } from '../lib/domain/money';
import { Eye } from 'lucide-react';

interface ProductCardProps {
  product: MenuProduct;
  onQuickPreview: (product: MenuProduct) => void;
}

export function ProductCard({ product, onQuickPreview }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const isSoldOut =
    product.status === 'SOLD_OUT' ||
    (product.stock_mode === 'TRACKED' && product.stock_quantity <= 0);

  const priceNum = typeof product.price_amount === 'string' ? Number(product.price_amount) : product.price_amount;
  const compareNum = product.compare_at_price
    ? (typeof product.compare_at_price === 'string' ? Number(product.compare_at_price) : product.compare_at_price)
    : null;

  const discountPercent =
    compareNum && compareNum > priceNum
      ? Math.round(((compareNum - priceNum) / compareNum) * 100)
      : null;

  /** Feed the CSS spotlight the pointer position (CSSOM only: CSP-safe, no re-render). */
  const handlePointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    el.style.setProperty('--my', `${event.clientY - rect.top}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handlePointerMove}
      onClick={() => onQuickPreview(product)}
      className="group pade-card rounded-2xl overflow-hidden flex flex-col justify-between h-full cursor-pointer"
    >
      {/* Product media */}
      <div className="relative w-full aspect-[4/3] bg-[var(--graphite)] overflow-hidden flex items-center justify-center p-3">
        {/* Inner vignette + top hairline highlight */}
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.07),transparent_65%)]" />
        <span className="pointer-events-none absolute top-0 inset-x-6 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.22)] to-transparent" />

        {product.primary_image ? (
          <Image
            src={product.primary_image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-[1.07] ${
              isSoldOut ? 'grayscale opacity-55' : ''
            }`}
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[var(--ash)]">
            <span className="text-3xl mb-1">
              {product.discord_select_emoji_name || '📦'}
            </span>
            <span className="text-[10px] font-light text-[var(--ash)]">Pade Store</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {product.is_featured && (
            <span className="pade-badge-hot px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase">
              HOT ✦
            </span>
          )}
          {discountPercent && !isSoldOut && (
            <span className="pade-badge-soft px-2 py-0.5 rounded-md text-[10px] font-semibold">
              -{discountPercent}%
            </span>
          )}
          {isSoldOut && (
            <span className="px-2 py-0.5 rounded-md bg-[var(--steel)]/90 text-[var(--ash)] text-[10px] font-medium border border-[var(--line)]">
              Hết hàng
            </span>
          )}
        </div>

        {/* Quick view overlay */}
        <div className="absolute inset-0 z-10 flex items-center justify-center gap-1.5 bg-gradient-to-t from-black/70 via-black/35 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-xs font-medium">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--void)]/70 border border-[var(--line-strong)] backdrop-blur-[2px]">
            <Eye className="w-3.5 h-3.5" />
            <span>Xem nhanh</span>
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="relative z-10 p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--ash)] mb-1.5">
            <span className="truncate">{product.category_name || 'Sản phẩm'}</span>
            <span className="pade-mono text-[10px] text-[var(--ash)] shrink-0">{product.sku}</span>
          </div>

          <h3 className="text-sm font-semibold text-[var(--white)] group-hover:text-[var(--silver-accent)] transition-colors line-clamp-1 mb-1.5">
            {product.name}
          </h3>

          <p className="text-xs text-[var(--text-2)] line-clamp-2 font-light leading-relaxed mb-3">
            {product.short_description || product.description || 'Ưu đãi đặc biệt từ Pade Store.'}
          </p>
        </div>

        {/* Price + action */}
        <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-base font-bold text-[var(--white)] tracking-tight truncate">
              {formatBrandMoney(product.price_amount)}
            </span>
            {compareNum && compareNum > priceNum && (
              <span className="text-xs text-[var(--ash)] line-through shrink-0">
                {formatBrandMoney(product.compare_at_price)}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickPreview(product);
            }}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isSoldOut
                ? 'bg-[var(--graphite)] text-[var(--ash)] cursor-not-allowed border border-[var(--line)]'
                : 'pade-btn pade-btn-primary px-3 py-1.5 text-xs'
            }`}
          >
            {isSoldOut ? 'Hết hàng' : 'Xem nhanh'}
          </button>
        </div>
      </div>
    </div>
  );
}
