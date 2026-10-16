import { redirect } from 'next/navigation';

interface ProductPageProps {
  params: { slug: string };
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  // One-page store: Redirect direct legacy /p/ links to root with ?product=<slug> (§1, §6)
  redirect(`/?product=${encodeURIComponent(params.slug)}`);
}
