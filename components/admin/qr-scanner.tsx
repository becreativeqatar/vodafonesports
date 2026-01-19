"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  Loader2,
  History,
  UserCheck,
  AlertCircle,
} from "lucide-react";

interface ScanResult {
  success: boolean;
  data?: {
    id: string;
    fullName: string;
    ageGroup: string;
    nationality: string;
    gender: string;
    status: string;
    checkedInAt?: string;
  };
  error?: string;
  message?: string;
}

interface ScanHistoryItem {
  id: string;
  fullName: string;
  ageGroup: string;
  success: boolean;
  timestamp: Date;
  error?: string;
}

export function QRScanner() {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [todayCheckIns, setTodayCheckIns] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch today's check-in count
  useEffect(() => {
    const fetchTodayStats = async () => {
      try {
        const response = await fetch("/api/registrations?status=CHECKED_IN&limit=1");
        const data = await response.json();
        if (data.success) {
          setTodayCheckIns(data.data.pagination.total);
        }
      } catch (error) {
        console.error("Failed to fetch check-in stats:", error);
      }
    };

    fetchTodayStats();
  }, [scanResult]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanning = async () => {
    setCameraError(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      if (!containerRef.current) return;

      // Clear any existing content
      containerRef.current.innerHTML = "";

      const scannerId = "qr-reader";
      const div = document.createElement("div");
      div.id = scannerId;
      containerRef.current.appendChild(div);

      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Stop scanning immediately
          try {
            await scanner.stop();
          } catch {
            // Ignore stop errors
          }
          setScanning(false);
          await handleScan(decodedText);
        },
        () => {}
      );

      setScanning(true);
      setScanResult(null);
    } catch (error: any) {
      console.error("Scanner error:", error);

      // Provide specific error messages based on the error type
      let errorMessage = "Unable to access camera. Please check permissions.";

      if (error?.name === "NotAllowedError") {
        errorMessage = "Camera permission denied. Please allow camera access in your browser settings.";
      } else if (error?.name === "NotFoundError") {
        errorMessage = "No camera found. Please connect a camera and try again.";
      } else if (error?.name === "NotReadableError") {
        errorMessage = "Camera is in use by another application. Please close other apps using the camera.";
      } else if (error?.name === "OverconstrainedError") {
        errorMessage = "Camera does not meet requirements. Please try a different camera.";
      }

      setCameraError(errorMessage);
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    }
    setScanning(false);
  };

  const handleScan = async (qrCode: string) => {
    setProcessing(true);
    setScanResult(null);

    try {
      const response = await fetch("/api/validation/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode }),
      });

      const result = await response.json();
      setScanResult(result);

      // Add to scan history
      const historyItem: ScanHistoryItem = {
        id: result.data?.id || `scan-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        fullName: result.data?.fullName || "Unknown",
        ageGroup: result.data?.ageGroup || "Unknown",
        success: result.success,
        timestamp: new Date(),
        error: result.error,
      };

      setScanHistory((prev) => [historyItem, ...prev].slice(0, 10)); // Keep last 10

      if (result.success) {
        toast({
          title: "Check-in Successful",
          description: `${result.data.fullName} has been checked in`,
          variant: "default",
        });
      }
    } catch (error) {
      const errorResult = {
        success: false,
        error: "Failed to process check-in",
      };
      setScanResult(errorResult);

      // Add failed scan to history
      setScanHistory((prev) => [{
        id: `scan-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        fullName: "Unknown",
        ageGroup: "Unknown",
        success: false,
        timestamp: new Date(),
        error: "Failed to process check-in",
      }, ...prev].slice(0, 10));
    } finally {
      setProcessing(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    startScanning();
  };

  return (
    <div className="space-y-6">
      {/* Today's Check-in Counter */}
      <Card className="bg-secondary-spring-green/10 border-secondary-spring-green/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-center gap-3">
            <UserCheck className="h-6 w-6 text-secondary-spring-green" />
            <span className="text-lg font-semibold text-vodafone-grey">
              {todayCheckIns} total check-ins
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            QR Code Scanner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Scanner Container */}
            <div
              ref={containerRef}
              className="relative w-full aspect-square max-w-md mx-auto bg-gray-100 rounded-lg overflow-hidden"
            >
              {!scanning && !scanResult && !processing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  {cameraError ? (
                    <>
                      <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
                      <p className="text-red-600 text-center text-sm">{cameraError}</p>
                    </>
                  ) : (
                    <>
                      <Camera className="h-16 w-16 text-gray-400 mb-4" />
                      <p className="text-gray-500">Click Start to begin scanning</p>
                    </>
                  )}
                </div>
              )}

              {/* Scanning Guidance Overlay */}
              {scanning && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white text-center">
                  <p className="text-sm font-medium">Position the QR code within the frame</p>
                  <p className="text-xs opacity-75 mt-1">Move closer if the code is small</p>
                </div>
              )}

              {processing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
            </div>

          {/* Scan Result */}
          {scanResult && (
            <div
              className={`p-4 rounded-lg ${
                scanResult.success
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {scanResult.success ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500 mt-0.5" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3
                    className={`font-semibold ${
                      scanResult.success ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {scanResult.success
                      ? "Check-in Successful"
                      : scanResult.error}
                  </h3>
                  {scanResult.data && (
                    <div className="mt-2 space-y-1">
                      <p className="text-lg font-medium">
                        {scanResult.data.fullName}
                      </p>
                      <div className="flex gap-2">
                        <Badge
                          variant={
                            scanResult.data.ageGroup.toLowerCase() as
                              | "kids"
                              | "youth"
                              | "adult"
                              | "senior"
                          }
                        >
                          {scanResult.data.ageGroup}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {scanResult.data.nationality}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

            {/* Controls */}
            <div className="flex gap-2 justify-center">
              {scanning ? (
                <Button variant="outline" onClick={stopScanning}>
                  <CameraOff className="h-4 w-4 mr-2" />
                  Stop Scanner
                </Button>
              ) : scanResult ? (
                <Button onClick={resetScanner}>
                  <Camera className="h-4 w-4 mr-2" />
                  Scan Another
                </Button>
              ) : (
                <Button onClick={startScanning}>
                  <Camera className="h-4 w-4 mr-2" />
                  Start Scanner
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4" />
              Recent Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scanHistory.map((item) => (
                <div
                  key={item.id + item.timestamp.getTime()}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    item.success
                      ? "bg-green-50 border border-green-100"
                      : "bg-red-50 border border-red-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{item.fullName}</p>
                      {item.success ? (
                        <Badge
                          variant={item.ageGroup.toLowerCase() as "kids" | "youth" | "adult" | "senior"}
                          className="text-xs"
                        >
                          {item.ageGroup}
                        </Badge>
                      ) : (
                        <p className="text-xs text-red-600">{item.error}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
