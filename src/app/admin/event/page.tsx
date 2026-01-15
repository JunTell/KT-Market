import Image from 'next/image'
import Link from 'next/link'

import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

type EventRow = {
  id: string
  slug: string
  category: string | null
  title: string
  thumbnail_url: string | null
  start_date: string | null
  end_date: string | null
  link: string | null
  option: string | null // jsonb면 any로
  is_finish: boolean
  created_at: string
  updated_at: string
}

export default async function AdminEventsPage() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('events')
    .select(
      'id, slug, category, title, thumbnail_url, start_date, end_date, link, option, is_finish, created_at, updated_at'
    )
    .order('created_at', { ascending: false })

  if (error) {
    return <div>에러: {error.message}</div>
  }

  const events = (data ?? []) as EventRow[]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">이벤트 관리</h1>
        <Link
          href="/admin/event/new"
          className="border rounded px-3 py-1.5 text-sm"
        >
          새 이벤트 만들기
        </Link>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead className="border-b border-white/10 text-white/60">
          <tr className="text-left">
            <th className="py-2 pr-3">Slug</th>
            <th className="py-2 pr-3">category</th>
            <th className="py-2 pr-3">title</th>
            <th className="py-2 pr-3">thumbnail</th>
            <th className="py-2 pr-3">start_date</th>
            <th className="py-2 pr-3">end_date</th>
            <th className="py-2 pr-3">Link</th>
            <th className="py-2 pr-3">Option</th>
            <th className="py-2 pr-3">isFinish</th>
            <th className="py-2 pr-3">Created</th>
            <th className="py-2 pr-3"></th>
          </tr>
        </thead>
        <tbody>
          {events.map((ev) => (
            <tr
              key={ev.id}
              className="border-b border-white/5 hover:bg-white/5"
            >
              <td className="py-2 pr-3">{ev.slug}</td>
              <td className="py-2 pr-3">{ev.category}</td>
              <td className="py-2 pr-3 max-w-[220px] truncate">
                {ev.title}
              </td>
              <td className="py-2 pr-3">
                {ev.thumbnail_url && (
                  <div className="relative w-24 h-12">
                    <Image
                      src={ev.thumbnail_url}
                      alt={ev.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
              </td>
              <td className="py-2 pr-3">
                {ev.start_date && new Date(ev.start_date).toLocaleDateString()}
              </td>
              <td className="py-2 pr-3">
                {ev.end_date && new Date(ev.end_date).toLocaleDateString()}
              </td>
              <td className="py-2 pr-3 text-xs">{ev.link}</td>
              <td className="py-2 pr-3 text-xs">
                {typeof ev.option === 'string'
                  ? ev.option
                  : JSON.stringify(ev.option)}
              </td>
              <td className="py-2 pr-3">
                <span
                  className={
                    'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ' +
                    (ev.is_finish
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-emerald-500/20 text-emerald-300')
                  }
                >
                  {ev.is_finish ? 'Yes' : 'No'}
                </span>
              </td>
              <td className="py-2 pr-3 text-[11px] text-white/40">
                {new Date(ev.created_at).toLocaleDateString()}
              </td>
              <td className="py-2 pr-3 text-right">
                <Link
                  href={`/admin/event/${ev.id}`}
                  className="text-xs underline"
                >
                  수정
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}