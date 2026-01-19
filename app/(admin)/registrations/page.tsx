import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { RegistrationsTable } from "@/components/admin/registrations-table";

interface RegistrationsPageProps {
  searchParams: {
    status?: string;
    ageGroup?: string;
    date?: string;
  };
}

export default async function RegistrationsPage({
  searchParams,
}: RegistrationsPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-vodafone-grey">Registrations</h1>
        <p className="text-gray-500">
          Manage and view all event registrations
        </p>
      </div>

      <RegistrationsTable
        userRole={session.user.role}
        initialStatus={searchParams.status}
        initialAgeGroup={searchParams.ageGroup}
        initialDate={searchParams.date}
      />
    </div>
  );
}
