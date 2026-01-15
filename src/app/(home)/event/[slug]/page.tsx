import { notFound } from 'next/navigation';

import type { Metadata } from 'next';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

// SEO: 이벤트 페이지 메타데이터
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;

    // TODO: Fetch event details from DB (e.g. 'events' table)
    // const event = await fetchEvent(slug);

    // Fallback logic for migration
    const eventName = slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

    return {
        title: `${eventName} | KT Market 이벤트`,
        description: `KT Market에서 진행하는 ${eventName} 이벤트를 확인해보세요.`,
        openGraph: {
            title: `${eventName} | KT Market`,
            description: `KT Market ${eventName} 이벤트 상세 정보`,
        }
    };
}

export default async function EventPage({ params }: PageProps) {
    const { slug } = await params;

    // TODO: Replace with actual DB fetch
    // const event = await fetchEvent(slug);

    // For now, render a placeholder if no DB logic yet
    // In migration, we might want to map old hardcoded events to new components or DB entries

    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
                <article className="prose lg:prose-xl">
                    <h1 className="text-3xl font-bold mb-4">{slug}</h1>
                    <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
                        {/* Event Content will go here */}
                        <p>이벤트 상세 내용이 준비 중입니다.</p>
                        <p className="text-sm mt-2">Event ID: {slug}</p>
                    </div>
                </article>
            </main>
        </div>
    );
}
