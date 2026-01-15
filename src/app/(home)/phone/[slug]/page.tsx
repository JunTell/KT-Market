import { notFound } from 'next/navigation';

import { ProductDetail } from '@/src/features/product/components/ProductDetail';
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server';

import type { Metadata } from 'next';
// import { CategoryPage } from '@/src/features/product/components/CategoryPage'; // (To be created if needed)

// 0. SEO: 동적 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;

    // A. 카테고리 페이지 메타데이터
    const CATEGORIES = ['samsung', 'apple', 'etc'];
    if (CATEGORIES.includes(slug.toLowerCase())) {
        const titleMap: Record<string, string> = {
            samsung: '삼성 갤럭시 스마트폰 | KT Market',
            apple: '애플 iPhone | KT Market',
            etc: '기타 스마트폰 | KT Market'
        };
        return {
            title: titleMap[slug] || `KT Market - ${slug}`,
            description: `${slug} 최신 스마트폰을 KT Market에서 만나보세요.`,
            openGraph: {
                title: titleMap[slug],
                images: [`/images/category/${slug}.png`] // Fallback or dynamic
            }
        };
    }

    // B. 제품 상세 페이지 메타데이터
    const supabase = await createSupabaseServerClient();
    const { data: device } = await supabase
        .from('devices')
        .select('model, pet_name, company')
        .eq('model', slug)
        .single();

    if (!device) {
        return {
            title: '제품을 찾을 수 없습니다 | KT Market',
            description: '요청하신 제품 정보가 없습니다.'
        };
    }

    const title = `${device.pet_name || device.model} | KT Market`;
    const description = `${device.company} ${device.pet_name} 구매 혜택과 제원을 확인하세요. KT 공식 온라인 대리점.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            // images: [...] // TODO: Add device image URL
        }
    };
}

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
            </div>
        );
    }

    // 2. 제품 상세 페이지 (Slug가 모델명인 경우)
    const supabase = await createSupabaseServerClient();

    // 'slug'가 DB의 'model' 컬럼이나 'pet_name'과 매칭된다고 가정
    // 기존 ProductPage 로직 재사용
    // URL 예시: /phone/s24, /phone/aip17

    // Try finding by model first (Exact match)
    const { data: device } = await supabase
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
            <main className="flex-1">
                <ProductDetail product={productAdapter} />
            </main>
        </div>
    );
}
