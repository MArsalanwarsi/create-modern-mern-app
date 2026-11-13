import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Sidebar } from "@/components/Sidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-6 sm:p-8 md:p-12 max-w-4xl overflow-hidden">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
