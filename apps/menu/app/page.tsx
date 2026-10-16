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
      <div className="min-h-screen flex flex-col bg-[var(--void)] text-[var(--off-white)]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-2xl bg-[var(--ink)] border border-[var(--line)] text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-950/40 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-800/40">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[var(--white)] mb-2 font-display">
              PADE STORE · Menu Temporarily Unavailable
            </h2>
            <p className="text-xs text-[var(--ash)] font-light mb-6 leading-relaxed">
              Hệ thống đang bảo trì hoặc cập nhật dữ liệu. Xin vui lòng thử lại trong giây lát.
            </p>
            <div className="p-2.5 rounded-lg bg-[var(--graphite)] text-xs text-[var(--silver-dim)] font-mono">
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

      <main id="catalog-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <MenuExplorer
          categories={catalog.categories}
          products={catalog.products}
          discordUrl={catalog.settings.discord_invite_url}
          initialProductSlug={searchParams.product}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--line)] py-10 bg-[var(--void)] text-xs text-[var(--ash)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[var(--white)] font-display">PADE STORE</span>
            <span>·</span>
            <span>a little menu for things you love 𐙚</span>
          </div>

          <div className="flex items-center space-x-4 text-[var(--text-2)]">
            <a href={catalog.settings.tos_url || '#'} className="hover:text-[var(--white)] transition-colors">
              TOS
            </a>
            <a href={catalog.settings.rules_url || '#'} className="hover:text-[var(--white)] transition-colors">
              Rules
            </a>
            <a href={catalog.settings.support_url || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--white)] transition-colors">
              Support
            </a>
            <a href={catalog.settings.discord_invite_url || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--white)] transition-colors">
              Discord
            </a>
          </div>
        </div>
      </footer>

      {/* Live Synchronization Island */}
      <LiveSync initialVersion={catalog.version} />
    </div>
  );
}
