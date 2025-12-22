import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 이벤트 통계
  const { count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })

  const { count: activeEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('is_finish', false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-white/60 mt-1">
          안녕하세요, {user?.email}님
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-white/10 rounded-lg p-6">
          <div className="text-white/60 text-sm">전체 이벤트</div>
          <div className="text-3xl font-bold mt-2">{totalEvents ?? 0}</div>
        </div>
        <div className="border border-white/10 rounded-lg p-6">
          <div className="text-white/60 text-sm">진행 중인 이벤트</div>
          <div className="text-3xl font-bold mt-2">{activeEvents ?? 0}</div>
        </div>
        <div className="border border-white/10 rounded-lg p-6">
          <div className="text-white/60 text-sm">종료된 이벤트</div>
          <div className="text-3xl font-bold mt-2">
            {(totalEvents ?? 0) - (activeEvents ?? 0)}
          </div>
        </div>
      </div>

      {/* 바로가기 */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">바로가기</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            href="/admin/events"
            className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition"
          >
            <div className="font-medium">이벤트 관리</div>
            <div className="text-sm text-white/60 mt-1">
              이벤트 목록 확인 및 관리
            </div>
          </Link>
          <Link
            href="/admin/events/new"
            className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition"
          >
            <div className="font-medium">새 이벤트 만들기</div>
            <div className="text-sm text-white/60 mt-1">
              새로운 이벤트 등록
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
