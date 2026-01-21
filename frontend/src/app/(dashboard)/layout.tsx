/**
 * Dashboard layout with sidebar and header.
 */

import { Sidebar, Header, MobileNav } from "@/components/layout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Sidebar for desktop */}
      <Sidebar />

      {/* Main content area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-0">
        <Header />
        <main className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 flex-1 min-h-0 overflow-auto">{children}</main>
      </div>

      {/* Mobile navigation */}
      <MobileNav />
    </div>
  );
}
