import { notFound } from 'next/navigation'
import EventForm from '../../../../features/admin/components/EventForm' // Leave as is, user will update if needed
import { getEventById } from '../../../../features/events/api/get-events'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const event = await getEventById(id)

  if (!event) notFound()

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-label-900">이벤트 수정</h1>
      <EventForm initialData={event} />
    </div>
  )
}