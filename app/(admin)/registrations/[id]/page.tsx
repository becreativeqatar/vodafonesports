"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime, maskQID, getAgeGroupLabel } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  Mail,
  Globe,
  Calendar,
  QrCode,
  UserCheck,
  XCircle,
  Clock,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import type { Registration } from "@/types";

export default function RegistrationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        const response = await fetch(`/api/registrations/${params.id}`);
        const data = await response.json();

        if (data.success) {
          setRegistration(data.data);
        } else {
          toast({
            title: "Error",
            description: data.error || "Registration not found",
            variant: "destructive",
          });
          router.push("/registrations");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load registration",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchRegistration();
    }
  }, [params.id, router, toast]);

  const handleStatusChange = async (newStatus: string) => {
    if (!registration) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/registrations/${registration.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setRegistration(data.data);
        toast({
          title: "Success",
          description: `Registration ${newStatus === "CHECKED_IN" ? "checked in" : "updated"} successfully`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update registration",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update registration",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!registration) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/registrations/${registration.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Registration deleted successfully",
        });
        router.push("/registrations");
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete registration",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete registration",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = {
      REGISTERED: "registered",
      CHECKED_IN: "checkedIn",
      CANCELLED: "cancelled",
    }[status] as "registered" | "checkedIn" | "cancelled";

    return <Badge variant={variant} className="text-sm">{status.replace("_", " ")}</Badge>;
  };

  const getAgeGroupBadge = (ageGroup: string) => {
    const variant = ageGroup.toLowerCase() as "kids" | "youth" | "adult" | "senior";
    return <Badge variant={variant} className="text-sm">{getAgeGroupLabel(ageGroup)}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (!registration) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/registrations")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-vodafone-grey">
              {registration.fullName}
            </h1>
            <p className="text-gray-500">Registration Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(registration.status)}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Registration Info */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{registration.fullName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="h-5 w-5 flex items-center justify-center text-gray-400 font-mono text-xs">
                ID
              </div>
              <div>
                <p className="text-sm text-gray-500">QID</p>
                <p className="font-medium font-mono">{maskQID(registration.qid)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{registration.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Globe className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Nationality</p>
                <p className="font-medium">{registration.nationality}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium">{registration.gender}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Age Group</p>
                {getAgeGroupBadge(registration.ageGroup)}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Registered At</p>
                <p className="font-medium">{formatDateTime(registration.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Registration Code
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p className="text-3xl font-mono font-bold text-center">
                  {registration.qrCode}
                </p>
              </div>
              <p className="text-sm text-gray-500 text-center">
                This code is encoded in the QR code sent to the participant
              </p>
            </CardContent>
          </Card>

          {/* Check-in Info */}
          {registration.status === "CHECKED_IN" && registration.checkedInAt && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  Check-in Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Checked in at:</span>
                  <span className="font-medium">{formatDateTime(registration.checkedInAt)}</span>
                </div>
                {registration.checkedInByUser && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Checked in by:</span>
                    <span className="font-medium">{registration.checkedInByUser.name}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {registration.status === "REGISTERED" && (
                <Button
                  className="w-full bg-secondary-spring-green hover:bg-secondary-spring-green/90"
                  onClick={() => handleStatusChange("CHECKED_IN")}
                  disabled={updating}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Check In
                </Button>
              )}

              {registration.status !== "CANCELLED" && (
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => handleStatusChange("CANCELLED")}
                  disabled={updating}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Registration
                </Button>
              )}

              {registration.status === "CANCELLED" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusChange("REGISTERED")}
                  disabled={updating}
                >
                  Restore Registration
                </Button>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={updating}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Registration
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Registration?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete the
                      registration for {registration.fullName}.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
