import Link from 'next/link';

import { getProducts } from '@/src/features/admin/products/actions';
import { ProductTable } from '@/src/features/admin/products/components/ProductTable';
import { requireAdmin } from '@/src/shared/lib/auth/admin';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
  }>;
}

export default async function ProductListPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || '';
  const category = params.category || 'all';

  // Fetch data via Server Action
  const { data, totalPages } = await getProducts({
    page,
    limit: 10,
    search,
    category,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">상품 재고 관리</h1>
          <p className="text-sm text-gray-500 mt-1">
            등록된 상품 목록을 확인하고 관리합니다. (총 {data.length > 0 ? totalPages * 10 : 0}개 예상)
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          + 신규 기기 등록
        </Link>
      </div>

      <ProductTable
        initialData={data}
        initialTotalPages={totalPages}
      />
    </div>
  );
}