export type EventRow = {
    id: string
    slug: string
    category: string | null
    title: string
    content: string | null
    thumbnail_url: string | null
    start_date: string | null
    end_date: string | null
    link: string | null
    option: any // jsonb from supabase
    is_finish: boolean
    created_at: string
    updated_at: string
}
