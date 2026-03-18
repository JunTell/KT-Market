import Image from 'next/image'
import Link from 'next/link'
import { deleteEventAction } from '../api/actions'
import { EventRow } from '../../../shared/types/event'

interface EventListTableProps {
    events: EventRow[]
}

export default function EventListTable({ events }: EventListTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
                <thead className="border-b border-line-200 text-label-500 bg-background-alternative">
                    <tr className="text-left">
                        <th className="px-4 py-3 font-medium">Slug</th>
                        <th className="px-4 py-3 font-medium">Category</th>
                        <th className="px-4 py-3 font-medium">Title</th>
                        <th className="px-4 py-3 font-medium">Thumbnail</th>
                        <th className="px-4 py-3 font-medium">Start Date</th>
                        <th className="px-4 py-3 font-medium">End Date</th>
                        <th className="px-4 py-3 font-medium">Link</th>
                        <th className="px-4 py-3 font-medium">isFinish</th>
                        <th className="px-4 py-3 font-medium">Created At</th>
                        <th className="px-4 py-3 font-medium border-l border-line-200 text-center w-24">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-line-200">
                    {events.map((ev) => (
                        <tr
                            key={ev.id}
                            className="hover:bg-background-alternative transition-colors"
                        >
                            <td className="px-4 py-3 truncate max-w-[120px] text-label-700">{ev.slug}</td>
                            <td className="px-4 py-3 text-label-700">{ev.category || '-'}</td>
                            <td className="px-4 py-3 max-w-[220px] truncate text-label-900 font-medium">
                                {ev.title}
                            </td>
                            <td className="px-4 py-3">
                                {ev.thumbnail_url ? (
                                    <div className="relative w-24 h-12 bg-line-100 rounded overflow-hidden">
                                        <Image
                                            src={ev.thumbnail_url}
                                            alt={ev.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <span className="text-label-400 text-xs">-</span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-label-700">
                                {ev.start_date ? new Date(ev.start_date).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-4 py-3 text-label-700">
                                {ev.end_date ? new Date(ev.end_date).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-4 py-3 text-xs text-label-500 truncate max-w-[150px]">{ev.link || '-'}</td>
                            <td className="px-4 py-3">
                                <span
                                    className={
                                        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ' +
                                        (ev.is_finish
                                            ? 'bg-status-disable text-label-500' // Using Juntell disabled state for finished variants
                                            : 'bg-[#E6F4EA] text-status-correct') // Using Juntell success color variable context
                                    }
                                >
                                    {ev.is_finish ? 'Finished' : 'Active'}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-[11px] text-label-500">
                                {new Date(ev.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-center align-middle border-l border-line-200">
                                <div className="flex flex-col gap-2 items-center justify-center">
                                    <Link
                                        href={`/admin/event/${ev.id}`}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        수정
                                    </Link>
                                    <form action={async () => {
                                        'use server'
                                        await deleteEventAction(ev.id)
                                    }}>
                                        <button type="submit" className="text-xs text-status-error hover:underline cursor-pointer">
                                            삭제
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {events.length === 0 && (
                        <tr>
                            <td colSpan={10} className="py-8 text-center text-label-500 bg-background-alternative/30">조회된 이벤트가 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
