import { notFound } from 'next/navigation';

import { Footer } from '@/src/shared/components/layout/Footer';
import { Header } from '@/src/shared/components/layout/Header';
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function BlogDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const supabase = await createSupabaseServerClient();

    // TODO: posts 테이블에 slug 컬럼이 있다면 .eq('slug', slug)로 변경해야 함.
    // 현재는 id로 조회하거나, 임시로 title 검색 등으로 대체.
    // 마이그레이션을 위해선 추후 posts 테이블에 unique slug 컬럼 추가 권장.

    // 임시 구현: ID(UUID) 포맷이면 ID로 조회, 아니면 Title 검색 (약식)
    let query = supabase.from('posts').select('*').eq('is_published', true);

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    if (isUUID) {
        query = query.eq('id', slug);
    } else {
        // Legacy URL이 ID가 아닌 사람이 읽을 수 있는 slug라면 DB 스키마 업데이트 필요.
        // 일단 title 검색으로 fallback (정확도 낮음)
        // 혹은 notFound() 처리하고 "URL 매핑 테이블"을 둬야 함.
        console.warn('Posts table needs slug column for legacy URL migration:', slug);
        // query = query.eq('slug', slug); // Un-comment after migration
        return notFound();
    }

    const { data: post } = await query.single();

    if (!post) {
        // 게시글이 없으면 404
        notFound();
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
                <article className="prose prose-lg max-w-none">
                    <header className="mb-8 not-prose">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
                        <div className="text-gray-500 text-sm flex gap-4">
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            <span>조회수 {post.view_count}</span>
                        </div>
                    </header>

                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </article>
            </main>
            <Footer />
        </div>
    );
}
