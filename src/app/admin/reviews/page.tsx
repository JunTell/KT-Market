import { getReviews } from '@/src/features/admin/reviews/actions';
import { ReviewTable } from '@/src/features/admin/reviews/components/ReviewTable';
import { requireAdmin } from '@/src/shared/lib/auth/admin';

interface PageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
    }>;
}

export default async function ReviewsPage({ searchParams }: PageProps) {
    await requireAdmin();

    const params = await searchParams;
    const page = Number(params.page) || 1;
    const search = params.search || '';

    const { data, totalPages } = await getReviews({
        page,
        limit: 10,
        search,
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">리뷰 관리</h1>
                <p className="text-sm text-gray-500">
                    고객이 작성한 상품 리뷰를 확인하고 관리(숨김 처리)합니다.
                </p>
            </div>

            <ReviewTable
                initialData={data}
                initialTotalPages={totalPages}
            />
        </div>
    );
}
