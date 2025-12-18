
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createSupabaseServerClient();
  const { data: event } = await supabase
    .from('events')
    .select('title')
    .eq('slug', params.slug)
    .single()

  return {
    title: event?.title || '이벤트 상세',
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const supabase = await createSupabaseServerClient();

  // 1. DB에서 slug로 데이터 조회
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', params.slug)
    .single()

  // 2. 데이터가 없으면 404 처리
  if (error || !event) {
    notFound()
  }

  return (
    <main className="max-w-4xl mx-auto py-10 px-4">
      <article>
        <header className="mb-8 border-b pb-4">
          <div className="text-sm text-blue-600 font-bold mb-2">
            {event.category || 'EVENT'}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>
          <div className="text-gray-500">
             기간: {event.start_date ? new Date(event.start_date).toLocaleDateString() : '상시'} ~ 
             {event.end_date ? new Date(event.end_date).toLocaleDateString() : ''}
          </div>
        </header>

        {event.thumbnail_url && (
          <div className="mb-8">
            <img 
              src={event.thumbnail_url} 
              alt={event.title} 
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>
        )}

        <div className="prose max-w-none whitespace-pre-wrap leading-relaxed text-gray-800">
          {event.content}
        </div>
        
        {event.link && (
            <div className="mt-8 text-center">
                <a 
                  href={event.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-block bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition"
                >
                    이벤트 참여하러 가기
                </a>
            </div>
        )}
      </article>
    </main>
  )
}