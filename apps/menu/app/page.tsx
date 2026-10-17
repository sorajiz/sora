import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { MenuExplorer } from '../components/MenuExplorer';
import { LiveSync } from '../components/LiveSync';
import { getPublicCatalog } from '../lib/catalog';
import { AlertCircle } from 'lucide-react';

export const revalidate = 60; // 60s ISR fallback, immediately invalidated on mutations

interface PageProps {
  searchParams: {
    product?: string;
  };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { product: productSlug } = searchParams;
  const catalog = await getPublicCatalog();

  if (productSlug) {
    const product = catalog.products.find((p) => p.slug === productSlug);
    if (product) {
      return {
        title: `${product.name} · Pade Store 𐙚`,
        description: product.short_description || `${product.name} tại Pade Store`,
        openGraph: {
          title: `${product.name} · Pade Store`,
          description: product.short_description || `Bảng giá ${product.name}`,
          images: product.primary_image ? [product.primary_image] : [],
        },
      };
    }
  }

  return {
    title: `${catalog.settings.store_name} · ${catalog.settings.tagline}`,
    description: 'ghé một chút, chọn điều bạn thích! Bảng menu sản phẩm & dịch vụ Discord chính thức tại Pade Store.',
  };
}

export default async function HomePage({ searchParams }: PageProps) {
  const catalog = await getPublicCatalog();

  // Customer Error State (§6, §10)
  if (catalog.error) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--void)] text-[var(--off-white)] pade-bg-layer">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="pade-dialog relative max-w-md w-full p-8 rounded-2xl text-center overflow-hidden">
            <span className="pointer-events-none absolute top-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.35)] to-transparent" />
            <div className="w-12 h-12 rounded-full bg-red-950/40 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-800/40">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[var(--white)] mb-2 font-display">
              PADE STORE · Menu Temporarily Unavailable
            </h2>
            <p className="text-xs text-[var(--ash)] font-light mb-6 leading-relaxed">
              Hệ thống đang bảo trì hoặc cập nhật dữ liệu. Xin vui lòng thử lại trong giây lát.
            </p>
            <div className="p-2.5 rounded-lg bg-[var(--graphite)] border border-[var(--line-soft)] text-xs text-[var(--silver-dim)] pade-mono">
              Reference: {catalog.referenceId}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // JSON-LD structured data for products
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: catalog.products.slice(0, 25).map((p, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        sku: p.sku,
        description: p.short_description || p.name,
        image: p.primary_image || undefined,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'VND',
          price: p.price_amount,
          availability:
            p.status === 'ACTIVE'
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          url: `https://menu.sorae.tokyo/?product=${p.slug}`,
        },
      },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col pade-bg-layer">
      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar
        discordUrl={catalog.settings.discord_invite_url}
        supportUrl={catalog.settings.support_url}
        saleUrl={catalog.settings.sale_url}
      />

      <Hero
        storeName={catalog.settings.store_name}
        tagline={catalog.settings.tagline}
        subtitle="products & services, kept simple."
        discordUrl={catalog.settings.discord_invite_url}
      />

      <main id="catalog-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-20 scroll-mt-20">
        {/* Section header */}
        <div className="flex items-center gap-4 mb-6 max-w-3xl mx-auto">
          <span className="pade-divider flex-1" />
          <div className="flex flex-col items-center gap-1">
            <span className="pade-kicker">Products &amp; services</span>
            <span className="text-[10px] text-[var(--ash)] font-light">
              {catalog.products.length} mục · cập nhật liên tục
            </span>
          </div>
          <span className="pade-divider flex-1" />
        </div>

        <MenuExplorer
          categories={catalog.categories}
          products={catalog.products}
          discordUrl={catalog.settings.discord_invite_url}
          initialProductSlug={searchParams.product}
        />
      </main>

      {/* Footer */}
      <footer className="relative border-t border-[var(--line)] py-12 bg-[var(--void)] text-xs text-[var(--ash)] overflow-hidden">
        <span className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-[rgba(208,211,217,0.3)] to-transparent" />
        <span className="pointer-events-none absolute inset-x-0 -bottom-24 h-40 bg-[radial-gradient(ellipse_60%_100%_at_50%_100%,rgba(208,211,217,0.07),transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--graphite)] border border-[var(--line)] text-[var(--silver-accent)] font-bold font-display">
              P
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-semibold text-[var(--white)] font-display tracking-[0.14em]">
                PADE STORE
              </span>
              <span className="text-[11px] font-light">a little menu for things you love 𐙚</span>
            </span>
          </div>

          <nav className="flex items-center gap-1 text-[var(--text-2)]">
            <a href={catalog.settings.tos_url || '#'} className="px-2.5 py-1.5 rounded-lg hover:text-[var(--white)] hover:bg-[var(--graphite)] transition-colors">
              TOS
            </a>
            <a href={catalog.settings.rules_url || '#'} className="px-2.5 py-1.5 rounded-lg hover:text-[var(--white)] hover:bg-[var(--graphite)] transition-colors">
              Rules
            </a>
            <a href={catalog.settings.support_url || '#'} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1.5 rounded-lg hover:text-[var(--white)] hover:bg-[var(--graphite)] transition-colors">
              Support
            </a>
            <a href={catalog.settings.discord_invite_url || '#'} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1.5 rounded-lg hover:text-[var(--white)] hover:bg-[var(--graphite)] transition-colors">
              Discord
            </a>
          </nav>
        </div>
      </footer>

      {/* Live Synchronization Island */}
      <LiveSync initialVersion={catalog.version} />
    </div>
  );
}
