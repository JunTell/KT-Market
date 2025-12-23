import Link from "next/link";

export default function AdminDashboardPage() {
  // TODO: Supabase나 Analytics API에서 실제 데이터 가져오기
  const stats = {
    todayVisitors: 124, // 예시 데이터
    todayOrders: 15,    // 예시 데이터 (구글 시트 연동 전)
    activeEvents: 3,    // 진행 중인 이벤트 수
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-label-900">관리자 대시보드</h1>
        <p className="text-label-700 mt-1">오늘의 현황을 한눈에 확인하세요.</p>
      </div>

      {/* 통계 카드 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="오늘 방문자 수" 
          value={`${stats.todayVisitors.toLocaleString()}명`} 
          trend="+5.2% (어제 대비)"
          trendColor="text-[var(--status-correct)]"
        />
        <StatCard 
          title="오늘 접수된 주문" 
          value={`${stats.todayOrders}건`} 
          subText="구글 시트 기준"
          actionLink="https://docs.google.com/spreadsheets/..." 
          actionLabel="시트 확인하기"
        />
        <StatCard 
          title="진행 중인 이벤트" 
          value={`${stats.activeEvents}개`} 
          actionLink="/admin/events" 
          actionLabel="관리하기"
        />
      </div>

      {/* 바로가기 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-background p-6 rounded-xl border border-line-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4">빠른 실행</h2>
          <div className="space-y-3">
            <Link 
              href="/admin/events/new"
              className="block w-full text-center py-3 px-4 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              + 새 이벤트 페이지 만들기
            </Link>
            <Link 
              href="/admin/products"
              className="block w-full text-center py-3 px-4 bg-background-alt text-label-800 rounded-lg hover:bg-line-200 transition-colors font-medium"
            >
              상품 재고 관리하러 가기
            </Link>
          </div>
        </div>

        {/* 최근 알림/메모 등 (MVP에서는 비워두거나 간단한 안내) */}
        <div className="bg-background p-6 rounded-xl border border-line-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4">관리자 메모</h2>
          <textarea 
            className="w-full h-32 p-3 bg-background-alt rounded-lg border border-line-200 text-sm resize-none focus:outline-none focus:border-primary"
            placeholder="간단한 메모를 남겨두세요 (로컬 저장 예시)"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  trend, 
  trendColor, 
  subText,
  actionLink,
  actionLabel
}: { 
  title: string; 
  value: string; 
  trend?: string; 
  trendColor?: string;
  subText?: string;
  actionLink?: string;
  actionLabel?: string;
}) {
  return (
    <div className="bg-background p-6 rounded-xl border border-line-200 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="text-label-700 text-sm font-medium mb-2">{title}</h3>
        <div className="text-3xl font-bold text-label-900">{value}</div>
        
        {trend && (
          <div className={`text-sm mt-2 font-medium ${trendColor}`}>
            {trend}
          </div>
        )}
        {subText && (
          <div className="text-sm mt-2 text-label-500">
            {subText}
          </div>
        )}
      </div>

      {actionLink && (
        <div className="mt-4 pt-4 border-t border-line-200">
          <Link href={actionLink} target={actionLink.startsWith('http') ? '_blank' : undefined} className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
            {actionLabel} <span>→</span>
          </Link>
        </div>
      )}
    </div>
  );
}