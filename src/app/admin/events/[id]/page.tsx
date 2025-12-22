import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditEventForm from './EditEventForm'

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !event) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">이벤트 수정</h1>
      <EditEventForm event={event} />
    </div>
  )
}
