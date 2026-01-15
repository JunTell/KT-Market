import { notFound } from 'next/navigation'

import EventForm from '@/src/features/admin/components/EventForm'
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) notFound()

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">이벤트 수정</h1>
      <EventForm initialData={event} />
    </div>
  )
}