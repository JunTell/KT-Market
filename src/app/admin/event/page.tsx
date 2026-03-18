import Link from 'next/link'
import { getEvents } from '../../../features/events/api/get-events'
import EventListTable from '../../../features/events/components/EventListTable'
import { cn } from '../../../shared/lib/utils/cn'

export default async function AdminEventsPage() {
  const events = await getEvents()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-line-200">
        <h1 className="text-2xl font-bold text-label-900 tracking-tight">이벤트 관리</h1>
        <Link
          href="/admin/event/new"
          className={cn(
            'inline-flex items-center justify-center gap-2 focus:outline-none rounded-lg transition-colors box-border',
            'bg-primary text-white hover:bg-primary-600',
            'px-4 py-2 text-body-2 font-medium'
          )}
        >
          새 이벤트 만들기
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-line-200 overflow-hidden">
        <EventListTable events={events} />
      </div>
    </div>
  )
}