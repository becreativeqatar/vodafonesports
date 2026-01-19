import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, getAgeGroupColor } from "@/lib/utils";
import { UserCheck } from "lucide-react";
import type { Registration } from "@prisma/client";

interface RecentActivityProps {
  checkIns: (Registration & {
    checkedInByUser?: { id: string; name: string } | null;
  })[];
}

export function RecentActivity({ checkIns }: RecentActivityProps) {
  if (checkIns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Recent Check-ins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            No check-ins yet. Check-ins will appear here during the event.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Recent Check-ins
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checkIns.map((checkIn) => (
            <div
              key={checkIn.id}
              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-4">
                <div className="bg-secondary-spring-green/10 p-2 rounded-full">
                  <UserCheck className="h-4 w-4 text-secondary-spring-green" />
                </div>
                <div>
                  <p className="font-medium text-vodafone-grey">
                    {checkIn.fullName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {checkIn.checkedInByUser?.name || "System"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge
                  variant={
                    checkIn.ageGroup.toLowerCase() as
                      | "kids"
                      | "youth"
                      | "adult"
                      | "senior"
                  }
                >
                  {checkIn.ageGroup}
                </Badge>
                <p className="text-xs text-gray-500 mt-1">
                  {checkIn.checkedInAt
                    ? formatDateTime(checkIn.checkedInAt)
                    : "N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
