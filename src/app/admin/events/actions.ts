'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'

export async function createEventAction(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const category = formData.get('category') as string
  const content = formData.get('content') as string
  const thumbnail_url = formData.get('thumbnail_url') as string
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string
  const link = formData.get('link') as string

  // 필수값 체크
  if (!title || !slug) {
    throw new Error('제목과 슬러그는 필수입니다.')
  }

  const { error } = await supabase.from('events').insert({
    title,
    slug,
    category: category || null,
    content,
    thumbnail_url: thumbnail_url || null,
    link,
    start_date: start_date ? new Date(start_date).toISOString() : null,
    end_date: end_date ? new Date(end_date).toISOString() : null,
    is_finish: false,
  })

  if (error) {
    console.error('이벤트 생성 실패:', error)
    throw new Error('이벤트 생성에 실패했습니다.')
  }

  // 캐시 갱신 (새로 생성된 글이 리스트에 바로 보이게 함)
  revalidatePath('/events')
  revalidatePath('/admin/events')

  // 생성 후 리스트 페이지나 상세 페이지로 이동
  redirect('/admin/events')
}

export async function updateEventAction(id: string, formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const category = formData.get('category') as string
  const content = formData.get('content') as string
  const thumbnail_url = formData.get('thumbnail_url') as string
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string
  const link = formData.get('link') as string
  const is_finish = formData.get('is_finish') === 'true'

  // 필수값 체크
  if (!title || !slug) {
    throw new Error('제목과 슬러그는 필수입니다.')
  }

  const { error } = await supabase
    .from('events')
    .update({
      title,
      slug,
      category: category || null,
      content,
      thumbnail_url: thumbnail_url || null,
      link,
      start_date: start_date ? new Date(start_date).toISOString() : null,
      end_date: end_date ? new Date(end_date).toISOString() : null,
      is_finish,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('이벤트 수정 실패:', error)
    throw new Error('이벤트 수정에 실패했습니다.')
  }

  // 캐시 갱신
  revalidatePath('/events')
  revalidatePath('/admin/events')
  revalidatePath(`/admin/events/${id}`)

  // 수정 후 리스트 페이지로 이동
  redirect('/admin/events')
}

export async function deleteEventAction(id: string) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('이벤트 삭제 실패:', error)
    throw new Error('이벤트 삭제에 실패했습니다.')
  }

  // 캐시 갱신
  revalidatePath('/events')
  revalidatePath('/admin/events')

  // 삭제 후 리스트 페이지로 이동
  redirect('/admin/events')
}