import { redirect } from 'next/navigation';

interface SearchPageProps {
  searchParams?: { q?: string };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  // One-page store: Redirect legacy /search to root with ?search=<q> (§1, §6)
  const q = searchParams?.q ? `?search=${encodeURIComponent(searchParams.q)}` : '';
  redirect(`/${q}`);
}

