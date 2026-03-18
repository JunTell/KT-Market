import { getAuthenticatedAdmin } from '../../shared/lib/auth/server-auth';
import { redirect } from 'next/navigation';
import { AuthInitializer } from '../../shared/components/providers/auth-initializer';
import { Sidebar } from '../../features/admin/components/Sidebar';
import { AdminLayoutShell } from '../../features/admin/components/AdminLayoutShell';
import { Header } from '../../features/admin/components/Header';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 서버에서 DB 직접 조회하여 검증
  const admin = await getAuthenticatedAdmin()

  if (!admin) {
    redirect('/login')
  }

  return (
    <AuthInitializer admin={admin}>
      <AdminLayoutShell>
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-8 overflow-y-auto bg-background-alternative">
            {children}
          </main>
        </div>
      </AdminLayoutShell>
    </AuthInitializer>
  );
}