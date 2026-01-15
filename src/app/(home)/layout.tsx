import { Footer } from "@/src/shared/components/layout/Footer";
import { Header } from "@/src/shared/components/layout/Header";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-center min-h-screen bg-background-alt">
      {/* App Container: Max 940px, Min 360px */}
      <div className="w-full max-w-[940px] min-w-[360px] bg-background shadow-2xl min-h-screen flex flex-col relative overflow-x-hidden">
        <Header />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}