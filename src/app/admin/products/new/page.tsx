'use client';

import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/src/shared/lib/supabase/client';
import { Device } from '@/src/shared/types/supabase';
import ProductForm from '@/src/features/admin/products/components/ProductForm';

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleSubmit = async (data: Partial<Device>) => {
    // Validate required fields
    if (!data.model) return;

    const { error } = await supabase.from('devices').insert([
      {
        ...data,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error(error);
      alert('등록 실패: ' + error.message);
      throw error;
    }

    alert('등록되었습니다.');
    router.push('/admin/products');
    router.refresh();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">신규 기기 등록</h1>
      <ProductForm onSubmit={handleSubmit} isEditMode={false} />
    </div>
  );
}