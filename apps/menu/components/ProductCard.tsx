'use client';

import React from 'react';
import Image from 'next/image';
import { MenuProduct } from '../lib/types';
import { formatBrandMoney } from '../lib/domain/money';
import { Eye } from 'lucide-react';

interface ProductCardProps {
  product: MenuProduct;
  onQuickPreview: (product: MenuProduct) => void;
}

export function ProductCard({ product, onQuickPreview }: ProductCardProps) {
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

  return (
    <div
      onClick={() => onQuickPreview(product)}
      className="group pade-card rounded-2xl overflow-hidden flex flex-col justify-between h-full cursor-pointer relative"
    >
      {/* Product Image Area */}
      <div className="relative w-full aspect-[4/3] bg-[var(--graphite)] overflow-hidden flex items-center justify-center p-3">
        {product.primary_image ? (
          <Image
            src={product.primary_image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain group-hover:scale-105 transition-transform duration-300 p-2"
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
            <span className="px-2 py-0.5 rounded-md bg-[var(--white)] text-[var(--void)] text-[10px] font-bold tracking-wider uppercase shadow-sm">
              HOT ✦
            </span>
          )}
          {discountPercent && !isSoldOut && (
            <span className="px-2 py-0.5 rounded-md bg-[var(--ink)] text-[var(--silver-accent)] text-[10px] font-semibold border border-[var(--line)]">
              -{discountPercent}%
            </span>
          )}
          {isSoldOut && (
            <span className="px-2 py-0.5 rounded-md bg-[var(--graphite)] text-[var(--ash)] text-[10px] font-medium border border-[var(--line)]">
              Hết hàng
            </span>
          )}
        </div>

        {/* Quick View Hover overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center space-x-1.5 transition-opacity duration-200 text-white text-xs font-medium">
          <Eye className="w-4 h-4" />
          <span>Xem nhanh</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & SKU */}
          <div className="flex items-center justify-between text-[11px] text-[var(--ash)] mb-1">
            <span>{product.category_name || 'Sản phẩm'}</span>
            <span className="text-[var(--ash)] font-mono text-[10px]">{product.sku}</span>
          </div>

          {/* Product Name */}
          <h3 className="text-sm font-semibold text-[var(--white)] group-hover:text-[var(--silver-accent)] transition-colors line-clamp-1 mb-1">
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-[var(--text-2)] line-clamp-2 font-light leading-relaxed mb-3">
            {product.short_description || product.description || 'Ưu đãi đặc biệt từ Pade Store.'}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between mt-auto">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-base font-bold text-[var(--white)] tracking-tight">
                {formatBrandMoney(product.price_amount)}
              </span>
              {compareNum && compareNum > priceNum && (
                <span className="text-xs text-[var(--ash)] line-through">
                  {formatBrandMoney(product.compare_at_price)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickPreview(product);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isSoldOut
                ? 'bg-[var(--graphite)] text-[var(--ash)] cursor-not-allowed'
                : 'bg-[var(--off-white)] text-[var(--void)] hover:bg-[var(--white)] shadow-sm'
            }`}
          >
            {isSoldOut ? 'Hết hàng' : 'Xem nhanh'}
          </button>
        </div>
      </div>
    </div>
  );
}
