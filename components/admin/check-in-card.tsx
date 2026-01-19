"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";
import { Search, UserCheck, Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";

interface LookupResult {
  id: string;
  qid: string;
  fullName: string;
  ageGroup: string;
  email: string;
  nationality: string;
  gender: string;
  qrCode: string;
  status: string;
  checkedInAt: string | null;
}

export function CheckInCard() {
  const { toast } = useToast();
  const [lookupType, setLookupType] = useState<"qid" | "email">("qid");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    if (!searchValue.trim()) {
      toast({
        title: "Error",
        description: "Please enter a value to search",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/validation/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: lookupType,
          value: searchValue.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || "Registration not found");
      }
    } catch (error) {
      setError("Failed to lookup registration");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!result) return;

    setCheckingIn(true);

    try {
      const response = await fetch("/api/validation/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: result.qrCode }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          ...result,
          status: "CHECKED_IN",
          checkedInAt: new Date().toISOString(),
        });
        toast({
          title: "Success",
          description: `${result.fullName} has been checked in`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check in participant",
        variant: "destructive",
      });
    } finally {
      setCheckingIn(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CHECKED_IN":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "REGISTERED":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "CANCELLED":
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setSearchValue("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Manual Lookup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="qid"
          onValueChange={(v) => setLookupType(v as "qid" | "email")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="qid">By QID</TabsTrigger>
            <TabsTrigger value="email">By Email</TabsTrigger>
          </TabsList>

          <TabsContent value="qid" className="mt-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter 11-digit QID"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                maxLength={11}
              />
              <Button onClick={handleLookup} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="email" className="mt-4">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              />
              <Button onClick={handleLookup} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Error State */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{result.fullName}</h3>
                <p className="text-sm text-gray-500">{result.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(result.status)}
                <Badge
                  variant={
                    result.status === "CHECKED_IN"
                      ? "checkedIn"
                      : result.status === "REGISTERED"
                        ? "registered"
                        : "cancelled"
                  }
                >
                  {result.status.replace("_", " ")}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">QID:</span>
                <p className="font-mono">{result.qid}</p>
              </div>
              <div>
                <span className="text-gray-500">Age Group:</span>
                <p>
                  <Badge
                    variant={
                      result.ageGroup.toLowerCase() as
                        | "kids"
                        | "youth"
                        | "adult"
                        | "senior"
                    }
                  >
                    {result.ageGroup}
                  </Badge>
                </p>
              </div>
              <div>
                <span className="text-gray-500">Nationality:</span>
                <p>{result.nationality}</p>
              </div>
              <div>
                <span className="text-gray-500">Gender:</span>
                <p>{result.gender}</p>
              </div>
              <div>
                <span className="text-gray-500">QR Code:</span>
                <p className="font-mono">{result.qrCode}</p>
              </div>
              {result.checkedInAt && (
                <div>
                  <span className="text-gray-500">Checked In:</span>
                  <p>{formatDateTime(result.checkedInAt)}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              {result.status === "REGISTERED" && (
                <Button
                  className="flex-1"
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                >
                  {checkingIn ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <UserCheck className="h-4 w-4 mr-2" />
                  )}
                  Check In
                </Button>
              )}
              <Button variant="outline" onClick={reset}>
                New Search
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
