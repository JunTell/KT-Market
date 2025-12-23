'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/src/lib/supabase/client';
import { Device } from '@/src/types/supabase';
import ProductForm from '@/src/components/admin/ProductForm';

export default function ProductEditPage({ params }: { params: Promise<{ model: string }> }) {
  const router = useRouter();
  const { model } = use(params);

  const [device, setDevice] = useState<Partial<Device>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const modelId = decodeURIComponent(model);
    fetchDevice(modelId);
  }, [model]);

  const fetchDevice = async (modelId: string) => {
    try {
      // [중요] 데이터 요청 전 세션 로드 대기 (RLS 통과 보장)
      await supabaseClient.auth.getSession();

      const { data, error } = await supabaseClient
        .from('devices')
        .select('*')
        .eq('model', modelId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setDevice(data);
      }
    } catch (error: any) {
      console.error('기기 로드 실패:', error);
      alert('기기 정보를 불러오지 못했습니다.');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: Partial<Device>) => {
    try {
      // [중요] 업데이트 전 세션 확인 - RLS 에러 방지
      await supabaseClient.auth.getSession();

      const { error } = await supabaseClient
        .from('devices')
        .update({
          ...data,
        })
        .eq('model', data.model!);

      if (error) throw error;

      alert('저장되었습니다.');
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert('저장 실패: ' + error.message);
      throw error;
    }
  };

  if (loading) return <div className="p-8">로딩 중...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <h1 className="text-2xl font-bold">기기 정보 수정 ({device.model})</h1>
      <ProductForm initialData={device} onSubmit={handleUpdate} isEditMode={true} />
    </div>
  );
}
