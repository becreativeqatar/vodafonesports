import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { MobileNav } from "@/components/admin/mobile-nav";
import { ValidatorScanner } from "@/components/admin/validator-scanner";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // No session - just render children (for login page)
  if (!session?.user) {
    return <>{children}</>;
  }

  // Validator gets a simplified, focused interface
  if (session.user.role === "VALIDATOR") {
    return <ValidatorScanner userName={session.user.name || "Validator"} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Navigation */}
      <MobileNav user={session.user} />

      {/* Desktop Layout */}
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar user={session.user} />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop Header - hidden on mobile (mobile has its own header) */}
          <div className="hidden lg:block">
            <AdminHeader user={session.user} />
          </div>

          {/* Main Content - add top padding on mobile for fixed header */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 pt-16 lg:pt-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
