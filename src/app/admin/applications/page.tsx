import { getApplications } from '@/src/features/admin/applications/actions';
import { ApplicationTable } from '@/src/features/admin/applications/components/ApplicationTable';

interface PageProps {
    searchParams: Promise<{
        page?: string;
        status?: string;
        search?: string;
        type?: string;
    }>;
}

export default async function ApplicationsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const status = params.status || 'all';
    const search = params.search || '';
    const type = params.type || 'all';

    // Fetch data
    const { data, totalPages } = await getApplications({
        page,
        limit: 10,
        status,
        search,
        type,
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">신청서 관리</h1>
                <p className="text-sm text-gray-500">
                    접수된 인터넷 및 모바일 신청서를 관리합니다.
                </p>
            </div>

            <ApplicationTable
                initialData={data}
                initialTotalPages={totalPages}
            />
        </div>
    );
}
