import { Footer } from '@/src/shared/components/layout/Footer';
import { Header } from '@/src/shared/components/layout/Header';

export default function AgreementPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
                <h1 className="text-2xl font-bold mb-8">주문 동의</h1>
                <div className="prose max-w-none text-gray-700 space-y-4 border p-6 rounded-lg bg-gray-50">
                    <p>주문 전 필수 확인 사항입니다.</p>
                    {/* 실제 동의 내용은 CMS나 정적 텍스트로 채워 넣어야 함 */}
                    <p>
                        1. 본 신청서는 가입 상담 예약을 위한 기초 자료입니다.<br />
                        2. 전문 상담사가 고객님께 해피콜을 드려 요금제 및 단말기 상세 조건을 안내해 드립니다.<br />
                        3. 단말기 재고 부족 시 개통이 지연될 수 있습니다.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
