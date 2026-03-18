import { createSupabaseServerClient } from '../../../shared/lib/supabase/server'
import { EventRow } from '../../../shared/types/event'

export async function getEvents(): Promise<EventRow[]> {
    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase
        .from('events')
        .select(
            'id, slug, category, title, thumbnail_url, start_date, end_date, link, option, is_finish, created_at, updated_at'
        )
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Failed to fetch events:', error)
        return []
    }

    return (data ?? []) as EventRow[]
}

export async function getEventById(id: string): Promise<EventRow | null> {
    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !data) {
        console.error('Failed to fetch event:', error)
        return null
    }

    return data as EventRow
}
