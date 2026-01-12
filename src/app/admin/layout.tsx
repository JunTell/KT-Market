import Link from "next/link";


export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-background-alt text-label-900 font-sans">
      {/* 사이드바 */}
      <aside className="w-64 bg-background border-r border-line-200 shrink-0 fixed h-full z-10">
        <div className="p-6 border-b border-line-200">
          <Link href="/admin" className="text-xl font-bold text-primary">
            KT Market Admin
          </Link>
        </div>

        <nav aria-label="Admin Navigation" className="p-4 space-y-1">
          <MenuLink href="/admin" label="대시보드" icon="📊" />

          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-label-500 uppercase">
            상품 및 이벤트
          </div>
          <MenuLink href="/admin/event" label="이벤트 페이지 관리" icon="🎉" />
          <MenuLink href="/admin/applications" label="신청서 관리" icon="📝" />
          <MenuLink href="/admin/consultations" label="상담 신청 관리" icon="📞" />
          <MenuLink href="/admin/reviews" label="리뷰 관리" icon="⭐" />
          <MenuLink href="/admin/posts" label="블로그/뉴스" icon="📰" />
          <MenuLink href="/admin/products" label="상품 재고 관리" icon="📦" />

          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-label-500 uppercase">
            주문 관리
          </div>
          {/* 구글 시트 링크는 외부 링크로 처리하거나 별도 페이지로 구성 */}
          <MenuLink href="https://docs.google.com/spreadsheets/..." label="주문 내역 (구글시트)" icon="📑" external />
        </nav>
      </aside>

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

const MenuLink = ({
  href,
  label,
  icon,
  external = false,
}: {
  href: string;
  label: string;
  icon: string;
  external?: boolean;
}) => {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-label-800 hover:bg-background-alt text-[var(--label-900)] transition-colors text-sm font-medium"
    >
      <span className="text-lg">{icon}</span>
      {label}
      {external && <span className="ml-auto text-xs text-label-500">↗</span>}
    </Link>
  );
}