import { Header } from "@/src/shared/components/layout/Header";
import { Footer } from "@/src/shared/components/layout/Footer";

export const dynamic = 'force-dynamic';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mobile-layout">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}