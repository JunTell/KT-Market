import { Header } from "@/src/shared/components/layout/Header";
import { Footer } from "@/src/shared/components/layout/Footer";

export const dynamic = 'force-dynamic';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-center min-h-screen bg-neutral-100">
      <div className="w-full max-w-[940px] min-w-[360px] bg-background shadow-xl min-h-screen overflow-x-hidden flex flex-col relative">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}