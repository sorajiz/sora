import { redirect } from 'next/navigation';

interface CategoryPageProps {
  params: { slug: string };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  // One-page store: Redirect direct legacy /category/ links to root with ?category=<slug> (§1, §6)
  redirect(`/?category=${encodeURIComponent(params.slug)}`);
}

