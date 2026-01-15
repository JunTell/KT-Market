import { getConsultations } from '@/src/features/admin/consultations/actions';
import { ConsultationTable } from '@/src/features/admin/consultations/components/ConsultationTable';

interface PageProps {
    searchParams: Promise<{
        page?: string;
        status?: string;
        search?: string;
    }>;
}

export default async function ConsultationsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const status = params.status || 'all';
    const search = params.search || '';

    // Fetch data
    const { data, totalPages } = await getConsultations({
        page,
        limit: 10,
        status,
        search,
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">상담 신청 관리</h1>
                <p className="text-sm text-gray-500">
                    고객의 상담 신청 내역을 확인하고 관리합니다.
                </p>
            </div>

            <ConsultationTable
                initialData={data}
                initialTotalPages={totalPages}
            />
        </div>
    );
}
