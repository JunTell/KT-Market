import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('events').select('title, thumbnail_url').eq('slug', slug).single()

  return {
    title: data?.title,
    openGraph: {
      images: data?.thumbnail_url ? [data.thumbnail_url] : [],
    }
  }
}

export default async function EventLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  // 1. Slug로 이벤트 조회
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!event) notFound()

  return (
    <div className="min-h-screen bg-white">
      {/* 1. 이벤트 헤더/배너 */}
      {event.thumbnail_url && (
        <div className="w-full relative h-[300px] md:h-[400px]">
          <Image
            src={event.thumbnail_url}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* 2. 본문 컨테이너 */}
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
          <p className="text-gray-500 text-sm">
            {new Date(event.start_date).toLocaleDateString()} ~ {new Date(event.end_date).toLocaleDateString()}
          </p>
        </header>

        {/* 3. 내용 (HTML 렌더링 가정) */}
        <article className="prose prose-lg max-w-none">
          {/* 만약 content가 단순 텍스트라면 그냥 {event.content} 사용 */}
          <div dangerouslySetInnerHTML={{ __html: event.content || '' }} />
        </article>

        {/* 4. 하단 버튼 (예: 상품 보러가기) */}
        {/* event.link 값이 있다면 버튼 노출 */}
        {event.link && (
          <div className="mt-12 text-center">
            <a
              href={event.link}
              className="inline-block px-8 py-4 bg-blue-600 text-white font-bold rounded-lg text-lg hover:bg-blue-700 transition-colors"
            >
              이벤트 자세히 보기 / 참여하기
            </a>
          </div>
        )}
      </div>
    </div>
  )
}