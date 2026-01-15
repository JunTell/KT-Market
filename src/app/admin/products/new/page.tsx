import CreateProductForm from '@/src/features/admin/products/components/CreateProductForm';
import { requireAdmin } from '@/src/shared/lib/auth/admin';

export default async function NewProductPage() {
  await requireAdmin();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">신규 기기 등록</h1>
      <CreateProductForm />
    </div>
  );
}