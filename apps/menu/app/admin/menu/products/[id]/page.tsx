import React from 'react';
import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import { MenuProduct } from '@/lib/types';
import { ProductEditorWithLivePreview } from '@/components/ProductEditorWithLivePreview';

export const dynamic = 'force-dynamic';

interface EditProductPageProps {
  params: { id: string };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const rows = await query<MenuProduct>(
    'SELECT * FROM menu_products WHERE id = $1',
    [params.id]
  );

  if (rows.length === 0) {
    notFound();
  }

  const product = rows[0];

  return <ProductEditorWithLivePreview initialProduct={product} isNew={false} />;
}
