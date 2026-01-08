'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/src/shared/lib/supabase/client';
import { Device } from '@/src/shared/types/supabase';
import ProductForm from '@/src/features/admin/components/ProductForm';

export default function ProductEditPage({ params }: { params: Promise<{ model: string }> }) {
  const router = useRouter();

  const { model } = use(params);

  const [device, setDevice] = useState<Partial<Device>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (model) fetchDevice();
  }, [model]);

  const fetchDevice = async () => {
    try {
      // [중요] 세션 확인
      await supabaseClient.auth.getSession();

      const modelId = decodeURIComponent(model);

      const { data, error } = await supabaseClient
        .from('devices')
        .select('*')
        .eq('model', modelId)
        .single();

      if (error) throw error;

      if (data) {
        setDevice(data);
      } else {
        alert('기기를 찾을 수 없습니다.');
        router.push('/admin/products');
      }
    } catch (error) {
      console.error('기기 정보 로드 실패:', error);
      alert('기기 정보를 불러오지 못했습니다.');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: Partial<Device>) => {
    try {
      // [중요] 저장 전 세션 확인
      await supabaseClient.auth.getSession();

      const { error } = await supabaseClient
        .from('devices')
        .update(data)
        .eq('model', data.model!); // PK 기준 업데이트

      if (error) throw error;

      alert('수정되었습니다.');
      router.refresh(); // 데이터 갱신
      router.push('/admin/products');
    } catch (error: any) {
      console.error(error);
      alert('수정 실패: ' + error.message);
    }
  };

  if (loading) return <div className="p-8">로딩 중...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-label-900">기기 정보 수정 ({device.model})</h1>

      {/* ProductForm 재사용 (Edit Mode) */}
      <ProductForm
        initialData={device}
        onSubmit={handleUpdate}
        isEditMode={true}
      />
    </div>
  );
}