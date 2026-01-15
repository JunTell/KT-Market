import { Footer } from '@/src/shared/components/layout/Footer';
import { Header } from '@/src/shared/components/layout/Header';

interface PageProps {
    params: Promise<{
        slug?: string[];
    }>;
}

export default async function AsamoCatchAllPage({ params }: PageProps) {
    const { slug } = await params;
    const path = slug ? slug.join('/') : 'index';

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 flex flex-col items-center justify-center py-20">
                <h1 className="text-3xl font-bold mb-4">아사모 제휴 페이지</h1>
                <p className="text-gray-500">
                    현재 보고 계신 페이지 경로: <code className="bg-gray-100 p-1 rounded font-mono">/asamo-page/{path}</code>
                </p>
                <div className="mt-8 p-6 bg-blue-50 rounded-lg text-center max-w-md">
                    <p className="mb-2 font-semibold">마케팅 랜딩 페이지 구현 영역</p>
                    <p className="text-sm text-gray-600">
                        기존 프레이머(Frammer)의 Landing 페이지 내용을 이곳에 이식하면 됩니다.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
