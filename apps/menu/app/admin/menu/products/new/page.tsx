import React from 'react';
import { ProductEditorWithLivePreview } from '@/components/ProductEditorWithLivePreview';

export default function NewProductPage() {
  return <ProductEditorWithLivePreview isNew={true} />;
}
