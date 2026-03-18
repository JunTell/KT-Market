'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '../../../shared/lib/supabase/server'
import { ActionState } from '../../../shared/types/action'
import { requireRole } from '../../../shared/lib/auth/server-auth'

export async function upsertEventAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
    try {
        // 권한 검증: 이벤트 수정/생성은 admin 권한이 필요하다고 가정 (필요에 따라 Role 조정)
        await requireRole(['admin', 'online', 'office'])

        const supabase = await createSupabaseServerClient()

        const id = formData.get('id') as string | null
        const title = formData.get('title') as string
        const slug = (formData.get('slug') as string) || title.replace(/\s+/g, '-').toLowerCase()
        const content = formData.get('content') as string
        const startDate = formData.get('start_date') as string
        const endDate = formData.get('end_date') as string
        const isFinish = formData.get('is_finish') === 'on'

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
            console.error('Supabase Error upserting event:', error)
            return { success: false, error: '이벤트 저장에 실패했습니다.' }
        }
    } catch (err: any) {
        console.error('Action execution failed:', err)
        return { success: false, error: err.message || '알 수 없는 오류가 발생했습니다.' }
    }

    revalidatePath('/admin/event')
    // revalidatePath `/event/${slug}` may not easily be accessible here without knowing the slug for edits, 
    // keeping the generic revalidate for the admin list
    redirect('/admin/event')
}

export async function deleteEventAction(id: string): Promise<ActionState> {
    try {
        await requireRole(['admin']) // 삭제는 보통 최고관리자만 허용

        const supabase = await createSupabaseServerClient()

        const { error } = await supabase.from('events').delete().eq('id', id)

        if (error) {
            console.error('Supabase Error deleting event:', error)
            return { success: false, error: '삭제 실패' }
        }
    } catch (err: any) {
        console.error('Action execution failed:', err)
        return { success: false, error: err.message || '알 수 없는 오류가 발생했습니다.' }
    }

    revalidatePath('/admin/event')
    redirect('/admin/event')
}
