'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { MenuProduct } from '../lib/types';
import { formatBrandMoney } from '../lib/domain/money';
import { X, MessageSquare, CheckCircle, ShieldCheck, Tag } from 'lucide-react';

interface QuickPreviewModalProps {
  product: MenuProduct | null;
  onClose: () => void;
  discordUrl?: string;
}

export function QuickPreviewModal({
  product,
  onClose,
  discordUrl = 'https://discord.gg/pade',
}: QuickPreviewModalProps) {
  useEffect(() => {
    if (!product) return;

    // Sync URL with ?product=<slug> without page reload (§6)
    const currentUrl = new URL(window.location.href);
    if (currentUrl.searchParams.get('product') !== product.slug) {
      currentUrl.searchParams.set('product', product.slug);
      window.history.pushState({ product: product.slug }, '', currentUrl.toString());
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handlePopState = () => {
      const url = new URL(window.location.href);
      if (!url.searchParams.has('product')) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [product, onClose]);

  if (!product) return null;

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

  const handleClose = () => {
    const currentUrl = new URL(window.location.href);
    if (currentUrl.searchParams.has('product')) {
      currentUrl.searchParams.delete('product');
      window.history.pushState({}, '', currentUrl.toString());
    }
    onClose();
  };

  const buyTicketUrl = `${discordUrl}?action=buy&sku=${encodeURIComponent(product.sku)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quickview-title"
    >
      <div
        className="pade-dialog relative w-full max-w-lg rounded-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top hairline */}
        <span className="pointer-events-none absolute top-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.4)] to-transparent z-10" />

        {/* Header */}
        <div className="relative px-5 py-3.5 border-b border-[var(--line)] flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-6 h-6 rounded-md bg-[var(--graphite)] border border-[var(--line)] flex items-center justify-center shrink-0">
              <Tag className="w-3 h-3 text-[var(--silver-dim)]" />
            </span>
            <span className="text-[11px] font-semibold text-[var(--silver-accent)] uppercase tracking-[0.18em] truncate">
              {product.category_name || 'Chi tiết sản phẩm'}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[var(--ash)] hover:text-[var(--white)] hover:bg-[var(--graphite)] transition-colors shrink-0"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Media */}
          <div className="relative w-full h-52 rounded-xl overflow-hidden flex items-center justify-center border border-[var(--line)] bg-[var(--graphite)] p-4">
            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.09),transparent_65%)]" />
            <span className="pointer-events-none absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.25)] to-transparent" />
            {product.primary_image ? (
              <Image
                src={product.primary_image}
                alt={product.name}
                fill
                className={`object-contain p-2 ${isSoldOut ? 'grayscale opacity-60' : ''}`}
              />
            ) : (
              <div className="relative text-center text-[var(--ash)]">
                <span className="text-4xl block mb-2">
                  {product.discord_select_emoji_name || '✦'}
                </span>
                <span className="text-xs pade-mono">{product.sku}</span>
              </div>
            )}

            {discountPercent && !isSoldOut && (
              <span className="absolute top-3 left-3 pade-badge-hot px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Title & SKU */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <h2 id="quickview-title" className="text-xl font-bold text-[var(--white)] font-display">
                {product.name}
              </h2>
              <span className="text-xs pade-mono px-2 py-0.5 rounded-md bg-[var(--graphite)] text-[var(--silver-accent)] border border-[var(--line)] shrink-0">
                {product.sku}
              </span>
            </div>
            {product.short_description && (
              <p className="text-xs text-[var(--text-2)] leading-relaxed font-light mt-1">
                {product.short_description}
              </p>
            )}
          </div>

          {/* Price & availability */}
          <div className="relative p-4 rounded-xl pade-panel--soft overflow-hidden flex items-center justify-between gap-3">
            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_100%_at_0%_0%,rgba(208,211,217,0.08),transparent_70%)]" />
            <div className="relative min-w-0">
              <div className="text-[11px] text-[var(--ash)] mb-1 uppercase tracking-wider">Giá sản phẩm</div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl font-bold text-[var(--white)] tracking-tight">
                  {formatBrandMoney(product.price_amount)}
                </span>
                {compareNum && compareNum > priceNum && (
                  <span className="text-sm text-[var(--ash)] line-through">
                    {formatBrandMoney(product.compare_at_price)}
                  </span>
                )}
              </div>
            </div>

            <div className="relative text-right shrink-0">
              <div className="text-[11px] text-[var(--ash)] mb-1 uppercase tracking-wider">Tình trạng</div>
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${
                  isSoldOut
                    ? 'bg-red-950/40 text-red-300 border-red-800/40'
                    : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                }`}
              >
                <CheckCircle className="w-3 h-3" />
                <span>{isSoldOut ? 'Hết hàng' : 'Sẵn sàng giao'}</span>
              </span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h4 className="text-[11px] font-semibold text-[var(--silver-accent)] uppercase tracking-[0.18em] mb-2">
                Mô tả chi tiết & bảo hành
              </h4>
              <div className="text-xs text-[var(--text-2)] font-light leading-relaxed whitespace-pre-wrap pade-panel--soft p-3.5 rounded-xl">
                {product.description}
              </div>
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--ash)]">
            <div className="flex items-center gap-2 p-2.5 rounded-lg pade-panel--soft">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--silver-accent)] shrink-0" />
              <span>Bảo hành uy tín</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg pade-panel--soft">
              <MessageSquare className="w-3.5 h-3.5 text-[var(--silver-accent)] shrink-0" />
              <span>Hỗ trợ Discord 24/7</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--line)] bg-[var(--void)]/60 flex items-center justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-[var(--ash)] hover:text-[var(--white)] hover:bg-[var(--graphite)] transition-colors"
          >
            Đóng
          </button>
          <a
            href={buyTicketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              isSoldOut
                ? 'bg-[var(--graphite)] text-[var(--ash)] cursor-not-allowed border border-[var(--line)]'
                : 'pade-btn pade-btn-primary pade-btn-sheen px-4 py-2 text-xs'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isSoldOut ? 'Tạm hết hàng' : 'Mua hàng / Mở Ticket'}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
