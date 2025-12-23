'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/src/lib/supabase/client';
import { VisitorChart, RevenueChart } from '@/src/components/admin/DashboardCharts';
import StatCard from '@/src/components/admin/StatCard';

interface DashboardStats {
  totalProducts: number;
  soldOutProducts: number;
  totalEvents: number;
  activeEvents: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    soldOutProducts: 0,
    totalEvents: 0,
    activeEvents: 0,
  });
  
  const [visitorData, setVisitorData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      console.log('대시보드 데이터 로딩 시작...');
      
      // [1] 세션 로드 대기 (가장 중요)
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
      if (sessionError || !session) {
        console.warn('세션이 없거나 로드 실패:', sessionError);
        // 세션이 없어도 비로그인 상태로 처리를 시도하거나, 여기서 return 할 수 있음
      }

      // [2] 병렬 요청 실행
      const [
        productsResult,
        soldOutResult,
        eventsResult,
        activeEventsResult,
        visitorsResult
      ] = await Promise.all([
        supabaseClient.from('devices').select('*', { count: 'exact', head: true }),
        supabaseClient.from('devices').select('*', { count: 'exact', head: true }).eq('is_available', false),
        supabaseClient.from('events').select('*', { count: 'exact', head: true }),
        supabaseClient.from('events').select('*', { count: 'exact', head: true }).eq('is_finish', false),
        supabaseClient.rpc('get_daily_visitors') // SQL 함수가 없으면 에러가 날 수 있음
      ]);

      // [3] 에러 로그 출력 (디버깅용)
      if (productsResult.error) console.error('상품 로드 에러:', productsResult.error);
      if (visitorsResult.error) console.error('방문자 통계 로드 에러:', visitorsResult.error);

      // [4] 데이터 설정
      setStats({
        totalProducts: productsResult.count || 0,
        soldOutProducts: soldOutResult.count || 0,
        totalEvents: eventsResult.count || 0,
        activeEvents: activeEventsResult.count || 0,
      });

      if (visitorsResult.data) {
        setVisitorData(visitorsResult.data);
      }

      // [5] 매출 데이터 (Mock)
      const mockRevenue = [
        { date: '12-16', revenue: 1500000 },
        { date: '12-17', revenue: 2300000 },
        { date: '12-18', revenue: 3200000 },
        { date: '12-19', revenue: 2800000 },
        { date: '12-20', revenue: 4500000 },
        { date: '12-21', revenue: 3900000 },
        { date: '12-22', revenue: 5100000 },
      ];
      setRevenueData(mockRevenue);

      console.log('대시보드 데이터 로딩 완료');

    } catch (error) {
      console.error('대시보드 로딩 중 치명적 에러:', error);
    } finally {
      // [6] 무조건 로딩 종료
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">데이터 집계 중...</div>;

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-label-900 mb-2">관리자 대시보드</h1>
        <p className="text-label-700">KT Market 관리자 페이지에 오신 것을 환영합니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          href="/admin/events"
          icon="🎉"
        />
        <StatCard 
          label="전체 이벤트 이력" 
          value={`${stats.totalEvents}건`} 
          desc="종료된 이벤트 포함"
          href="/admin/events"
          icon="🗂️"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VisitorChart data={visitorData} />
        <RevenueChart data={revenueData} />
      </div>

      <div className="bg-white p-6 rounded-lg border border-line-200">
        <h2 className="text-lg font-bold mb-4">빠른 작업</h2>
        <div className="flex gap-4">
          <Link 
            href="/admin/products/new" 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition-colors"
          >
            + 신규 기기 등록
          </Link>
          <Link 
            href="/admin/events/new" 
            className="px-4 py-2 border border-line-400 rounded hover:bg-bg-alternative transition-colors"
          >
            + 새 이벤트 만들기
          </Link>
        </div>
      </div>
    </div>
  );
}