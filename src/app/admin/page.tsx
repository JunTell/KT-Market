import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server';
import { requireAdmin } from '@/src/shared/lib/auth/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { VisitorChart, RevenueChart } from '@/src/features/admin/components/DashboardCharts';
import StatCard from '@/src/features/admin/components/StatCard';

interface DashboardStats {
  totalProducts: number;
  soldOutProducts: number;
  totalEvents: number;
  activeEvents: number;
}

export default async function AdminDashboardPage() {

  const supabase = await createSupabaseServerClient();

  // [1] Check Auth & Admin Role
  await requireAdmin();

  // [3] Fetch Data in Parallel
  const [
    productsResult,
    soldOutResult,
    eventsResult,
    activeEventsResult,
    visitorsResult
  ] = await Promise.all([
    supabase.from('devices').select('*', { count: 'exact', head: true }),
    supabase.from('devices').select('*', { count: 'exact', head: true }).eq('is_available', false),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('is_finish', false),
    supabase.rpc('get_daily_visitors')
  ]);

  const stats: DashboardStats = {
    totalProducts: productsResult.count || 0,
    soldOutProducts: soldOutResult.count || 0,
    totalEvents: eventsResult.count || 0,
    activeEvents: activeEventsResult.count || 0,
  };

  const visitorData = visitorsResult.data || [];

  // [Mock] Revenue Data
  const revenueData = [
    { date: '12-16', revenue: 1500000 },
    { date: '12-17', revenue: 2300000 },
    { date: '12-18', revenue: 3200000 },
    { date: '12-19', revenue: 2800000 },
    { date: '12-20', revenue: 4500000 },
    { date: '12-21', revenue: 3900000 },
    { date: '12-22', revenue: 5100000 },
  ];


  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-label-900 mb-2">관리자 대시보드</h1>
        <p className="text-label-700">KT Market 관리자 페이지에 오신 것을 환영합니다.</p>
      </div>

      <section aria-label="Key Statistics" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="전체 등록 기기"
          value={`${stats.totalProducts}건`}
          desc="현재 관리 중인 모든 기기"
          href="/admin/products"
          icon="📱"
        />
        <StatCard
          label="품절 / 판매중지"
          value={`${stats.soldOutProducts}건`}
          desc="재고 관리가 필요한 항목"
          href="/admin/products"
          isWarning={stats.soldOutProducts > 0}
          icon="⚠️"
        />
        <StatCard
          label="진행 중 이벤트"
          value={`${stats.activeEvents}건`}
          desc="현재 노출 중인 프로모션"
          href="/admin/event"
          icon="🎉"
        />
        <StatCard
          label="전체 이벤트 이력"
          value={`${stats.totalEvents}건`}
          desc="종료된 이벤트 포함"
          href="/admin/event"
          icon="🗂️"
        />
      </section>

      <section aria-label="Analytics Charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VisitorChart data={visitorData} />
        <RevenueChart data={revenueData} />
      </section>

      <section aria-labelledby="quick-actions-heading" className="bg-white p-6 rounded-lg border border-line-200">
        <h2 id="quick-actions-heading" className="text-lg font-bold mb-4">빠른 작업</h2>
        <div className="flex gap-4">
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition-colors"
          >
            + 신규 기기 등록
          </Link>
          <Link
            href="/admin/event/new"
            className="px-4 py-2 border border-line-400 rounded hover:bg-bg-alternative transition-colors"
          >
            + 새 이벤트 만들기
          </Link>
        </div>
      </section>
    </div>
  );
}