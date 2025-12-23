'use client';

import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/src/lib/supabase/client';
import { Device } from '@/src/types/supabase';
import ProductForm from '@/src/components/admin/ProductForm';

export default function ProductNewPage() {
  const router = useRouter();

  const handleCreate = async (data: Partial<Device>) => {
    try {
      // [중요] 세션 확인 - RLS 에러 방지
      await supabaseClient.auth.getSession();

      // INSERT
      const { error } = await supabaseClient
        .from('devices')
        .insert({
          ...data,
        } as Device);

      if (error) throw error;

      alert('등록되었습니다.');
      router.push('/admin/products');
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert('등록 실패: ' + error.message);
      throw error;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <h1 className="text-2xl font-bold">신규 기기 등록</h1>
      <ProductForm onSubmit={handleCreate} isEditMode={false} />
    </div>
  );
}
