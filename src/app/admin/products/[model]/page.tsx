import { notFound } from 'next/navigation';

import EditProductForm from '@/src/features/admin/products/components/EditProductForm';
import { requireAdmin } from '@/src/shared/lib/auth/admin';
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server';


export default async function ProductEditPage({ params }: { params: Promise<{ model: string }> }) {
  await requireAdmin();
  const { model: rawModel } = await params;
  const modelId = decodeURIComponent(rawModel);

  const supabase = await createSupabaseServerClient();
  const { data: device, error } = await supabase
    .from('devices')
    .select('*')
    .eq('model', modelId)
    .single();

  if (error || !device) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-label-900">기기 정보 수정 ({device.model})</h1>
      <EditProductForm initialData={device} />
    </div>
  );
}