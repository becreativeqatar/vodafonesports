import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Mail, Users, Clock } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-vodafone-grey">Settings</h1>
        <p className="text-gray-500">Manage system settings and configuration</p>
      </div>

      <div className="grid gap-6">
        {/* Event Information */}
        <Card>
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
            <CardDescription>
              Details about the Sports Village event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-vodafone-red" />
              <div>
                <p className="text-sm text-gray-500">Event Date</p>
                <p className="font-medium">Tuesday, 10 February 2026</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-vodafone-red" />
              <div>
                <p className="text-sm text-gray-500">Event Time</p>
                <p className="font-medium">7:30 AM - 4:30 PM (Qatar Time)</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-vodafone-red" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <a
                  href="https://share.google/wSJgqfIyYScjsx5uo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-vodafone-red hover:underline"
                >
                  Downtown Msheireb, Barahat Msheireb
                </a>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-vodafone-red" />
              <div>
                <p className="text-sm text-gray-500">Maximum Capacity</p>
                <p className="font-medium">6,000 participants</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-vodafone-red" />
              <div>
                <p className="text-sm text-gray-500">Contact Email</p>
                <p className="font-medium">sportsvillage@vodafone.qa</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Status */}
        <Card>
          <CardHeader>
            <CardTitle>Registration Status</CardTitle>
            <CardDescription>
              Current status of the registration system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Public Registration</p>
                <p className="text-sm text-gray-500">
                  Allow new participants to register
                </p>
              </div>
              <Badge variant="checkedIn">Open</Badge>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Technical details about the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Platform Version</span>
              <span className="font-mono text-sm">1.0.0</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-gray-500">Framework</span>
              <span className="font-mono text-sm">Next.js 14</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-gray-500">Database</span>
              <span className="font-mono text-sm">PostgreSQL (Supabase)</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-gray-500">Environment</span>
              <Badge variant="secondary">
                {process.env.NODE_ENV || "development"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
