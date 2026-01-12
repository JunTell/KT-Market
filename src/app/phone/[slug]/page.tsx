import { Header } from '@/src/shared/components/layout/Header';
import { Footer } from '@/src/shared/components/layout/Footer';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server';
import { ProductDetail } from '@/src/features/product/components/ProductDetail';
// import { CategoryPage } from '@/src/features/product/components/CategoryPage'; // (To be created if needed)

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function PhonePage({ params }: PageProps) {
    const { slug } = await params;

    // 1. 카테고리 페이지 여부 확인
    // Legacy: /phone/samsung, /phone/apple
    const CATEGORIES = ['samsung', 'apple', 'etc'];
    const isCategory = CATEGORIES.includes(slug.toLowerCase());

    if (isCategory) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
                    {/* Category Page Implementation (Simple Placeholder for now) */}
                    <h1 className="text-3xl font-bold mb-6 capitalize">{slug} Phones</h1>
                    <p className="text-gray-600 mb-8">
                        {slug === 'samsung' ? '삼성 갤럭시의 모든 것' : slug === 'apple' ? 'iPhone의 모든 것' : '다양한 스마트폰'}
                    </p>

                    {/* TODO: Fetch products by category and render list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="border rounded-lg p-4 h-64 flex items-center justify-center bg-gray-50">
                                상품 리스트 영역 ({slug})
                            </div>
                        ))}
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // 2. 제품 상세 페이지 (Slug가 모델명인 경우)
    const supabase = await createSupabaseServerClient();

    // 'slug'가 DB의 'model' 컬럼이나 'pet_name'과 매칭된다고 가정
    // 기존 ProductPage 로직 재사용
    // URL 예시: /phone/s24, /phone/aip17

    // Try finding by model first (Exact match)
    let { data: device } = await supabase
        .from('devices')
        .select('*')
        .eq('model', slug) // Assuming slug might match model ID directly? Usually slugs are cleaner.
        .single();

    // If not found, try pet_name or other slug field if exists. 
    // Since we don't have a dedicated 'slug' in devices table yet, we might need fuzzy search or just model for now.
    // Warning: 'aip17' might not exist in 'model' column (e.g. SM-S928N).
    // We likely need a mapping or a 'slug' column in 'devices' table.

    if (!device) {
        // Fallback: Try searching case-insensitive or by pet_name if possible (not efficient without index)
        // For now, if no match, 404.
        notFound();
    }

    // Transform Device to Product Props (Mocking missing fields for now based on ProductDetail requirements)
    const productAdapter = {
        ...device,
        id: device.model,
        name: device.pet_name || device.model,
        description: `출고가: ${device.price?.toLocaleString()}원`,
        thumbnail: device.thumbnail ? `${process.env.NEXT_PUBLIC_CDN_URL}/phone/${device.category}/${device.thumbnail}/01.png` : '',
        category: device.category || 'SmartPhone',
        price: device.price || 0,
        currency: 'KRW',
        brand: device.company || 'Unknown',
        sku: device.model,
        images: device.thumbnail ? [`${process.env.NEXT_PUBLIC_CDN_URL}/phone/${device.category}/${device.thumbnail}/01.png`] : [],
        // Add other missing props required by ProductDetail if any
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* @ts-ignore: Adapter typing mismatch might exist */}
                <ProductDetail product={productAdapter} />
            </main>
            <Footer />
        </div>
    );
}
