import { getPosts } from '@/src/features/admin/posts/actions';
import { PostTable } from '@/src/features/admin/posts/components/PostTable';

interface PageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
    }>;
}

export default async function PostsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const search = params.search || '';

    const { data, totalPages } = await getPosts({
        page,
        limit: 10,
        search,
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">블로그 / 뉴스 관리</h1>
                <p className="text-sm text-gray-500">
                    공지사항, 뉴스, 블로그 포스트를 작성하고 관리합니다.
                </p>
            </div>

            <PostTable
                initialData={data}
                initialTotalPages={totalPages}
            />
        </div>
    );
}
