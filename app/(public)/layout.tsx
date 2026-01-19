import { Logo } from "@/components/shared/logo";
import { PublicHeader } from "@/components/public/public-header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Conditional Header - hidden on home page */}
      <PublicHeader />

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer - Compact */}
      <footer className="bg-vodafone-grey text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo variant="white" />
            <p className="text-sm text-gray-400">
              © 2026 Vodafone Qatar. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
