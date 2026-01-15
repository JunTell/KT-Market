'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

// 이벤트 생성/수정 로직
export async function upsertEvent(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const id = formData.get('id') as string | null
  const title = formData.get('title') as string
  // slug가 비어있으면 제목을 기반으로 생성하거나, 필수값으로 입력받음
  const slug = (formData.get('slug') as string) || title.replace(/\s+/g, '-').toLowerCase()
  const content = formData.get('content') as string
  const startDate = formData.get('start_date') as string
  const endDate = formData.get('end_date') as string
  const isFinish = formData.get('is_finish') === 'on'

  // TODO: 이미지 업로드 로직은 별도로 처리하여 URL만 넘겨받았다고 가정
  const thumbnailUrl = formData.get('thumbnail_url') as string

  const eventData = {
    title,
    slug,
    content,
    start_date: startDate || null,
    end_date: endDate || null,
    thumbnail_url: thumbnailUrl,
    is_finish: isFinish,
    updated_at: new Date().toISOString(),
  }

  let error;

  if (id) {
    // 수정
    const { error: updateError } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', id)
    error = updateError
  } else {
    // 생성
    const { error: insertError } = await supabase
      .from('events')
      .insert(eventData)
    error = insertError
  }

  if (error) {
    console.error(error)
    throw new Error('이벤트 저장 실패')
  }

  revalidatePath('/admin/event')
  revalidatePath(`/event/${slug}`) // 캐시 갱신
  redirect('/admin/event')
}

export async function deleteEvent(id: string) {
  const supabase = await createSupabaseServerClient()

  // 1. Storage 이미지 삭제 (선택사항: 찌꺼기 파일 방지)
  // (이미지 경로를 DB에서 조회해서 storage.remove 하는 로직이 필요할 수 있음)

  // 2. DB 데이터 삭제
  const { error } = await supabase.from('events').delete().eq('id', id)

  if (error) throw new Error('삭제 실패')

  revalidatePath('/admin/event')
  revalidatePath('/event') // 관련 캐시 초기화
}