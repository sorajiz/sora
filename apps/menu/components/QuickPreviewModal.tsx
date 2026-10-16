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
        className="relative w-full max-w-lg bg-[var(--ink)] border border-[var(--line)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[var(--line)] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tag className="w-3.5 h-3.5 text-[var(--silver-dim)]" />
            <span className="text-xs font-semibold text-[var(--silver-accent)] uppercase tracking-wider">
              {product.category_name || 'Chi tiết sản phẩm'}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[var(--ash)] hover:text-[var(--white)] hover:bg-[var(--graphite)] transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Product Media Area */}
          <div className="relative w-full h-52 bg-[var(--graphite)] rounded-xl overflow-hidden flex items-center justify-center border border-[var(--line)] p-4">
            {product.primary_image ? (
              <Image
                src={product.primary_image}
                alt={product.name}
                fill
                className="object-contain p-2"
              />
            ) : (
              <div className="text-center text-[var(--ash)]">
                <span className="text-4xl block mb-2">
                  {product.discord_select_emoji_name || '✦'}
                </span>
                <span className="text-xs font-mono">{product.sku}</span>
              </div>
            )}
          </div>

          {/* Title & SKU */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-1">
              <h2 id="quickview-title" className="text-xl font-bold text-[var(--white)] font-display">
                {product.name}
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--graphite)] text-[var(--silver-accent)] border border-[var(--line)] shrink-0">
                {product.sku}
              </span>
            </div>
            {product.short_description && (
              <p className="text-xs text-[var(--text-2)] leading-relaxed font-light mt-1">
                {product.short_description}
              </p>
            )}
          </div>

          {/* Price & Availability */}
          <div className="p-4 rounded-xl bg-[var(--graphite)] border border-[var(--line)] flex items-center justify-between">
            <div>
              <div className="text-xs text-[var(--ash)] mb-0.5">Giá sản phẩm</div>
              <div className="flex items-baseline space-x-2">
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

            <div className="text-right">
              <div className="text-xs text-[var(--ash)] mb-0.5">Tình trạng</div>
              <span
                className={`inline-flex items-center space-x-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                  isSoldOut
                    ? 'bg-red-950/40 text-red-300 border border-red-800/40'
                    : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
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
              <h4 className="text-xs font-semibold text-[var(--silver-accent)] uppercase tracking-wider mb-2">
                Mô tả chi tiết & bảo hành
              </h4>
              <div className="text-xs text-[var(--text-2)] font-light leading-relaxed whitespace-pre-wrap bg-[var(--graphite)]/60 p-3.5 rounded-xl border border-[var(--line)]">
                {product.description}
              </div>
            </div>
          )}

          {/* Guarantee Badges */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--ash)]">
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-[var(--graphite)]/40 border border-[var(--line)]">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--silver-accent)]" />
              <span>Bảo hành uy tín</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-[var(--graphite)]/40 border border-[var(--line)]">
              <MessageSquare className="w-3.5 h-3.5 text-[var(--silver-accent)]" />
              <span>Hỗ trợ Discord 24/7</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[var(--line)] bg-[var(--ink)] flex items-center justify-end space-x-2">
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
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              isSoldOut
                ? 'bg-[var(--graphite)] text-[var(--ash)] cursor-not-allowed'
                : 'bg-[var(--off-white)] text-[var(--void)] hover:bg-[var(--white)] shadow-md active:scale-95'
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
