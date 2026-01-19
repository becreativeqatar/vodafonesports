import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { QRScanner } from "@/components/admin/qr-scanner";
import { CheckInCard } from "@/components/admin/check-in-card";

export default async function ValidationPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-vodafone-grey">Validation</h1>
        <p className="text-gray-500">
          Scan QR codes or lookup participants to check them in
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <QRScanner />
        <CheckInCard />
      </div>
    </div>
  );
}
