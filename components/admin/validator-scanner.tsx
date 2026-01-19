"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/shared/logo";
import { signOut } from "next-auth/react";
import {
  Camera,
  CheckCircle2,
  XCircle,
  Loader2,
  LogOut,
  RotateCcw,
} from "lucide-react";

interface ScanResult {
  success: boolean;
  data?: {
    id: string;
    fullName: string;
    ageGroup: string;
    status: string;
  };
  error?: string;
}

interface ValidatorScannerProps {
  userName: string;
}

export function ValidatorScanner({ userName }: ValidatorScannerProps) {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [todayCheckIns, setTodayCheckIns] = useState(0);
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch today's check-in count
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/registrations?status=CHECKED_IN&limit=1");
        const data = await response.json();
        if (data.success) {
          setTodayCheckIns(data.data.pagination.total);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();
  }, [scanResult]);

  useEffect(() => {
    // Auto-start scanner on mount
    startScanning();
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      // Stop any existing scanner first
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch {
          // Ignore stop errors
        }
        scannerRef.current = null;
      }

      const { Html5Qrcode } = await import("html5-qrcode");

      if (!containerRef.current) return;
      containerRef.current.innerHTML = "";

      const scannerId = "validator-qr-reader";
      const div = document.createElement("div");
      div.id = scannerId;
      containerRef.current.appendChild(div);

      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 280, height: 280 },
        },
        async (decodedText) => {
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
      setScanning(false);

      let message = "Unable to access camera. Please check permissions.";
      if (error?.message?.includes("NotAllowedError") || error?.name === "NotAllowedError") {
        message = "Camera permission denied. Please allow camera access and refresh.";
      } else if (error?.message?.includes("NotFoundError") || error?.name === "NotFoundError") {
        message = "No camera found on this device.";
      } else if (error?.message?.includes("NotReadableError") || error?.name === "NotReadableError") {
        message = "Camera is in use by another application.";
      }

      toast({
        title: "Camera Error",
        description: message,
        variant: "destructive",
      });
    }
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

      if (result.success) {
        // Play success sound/vibrate
        if (navigator.vibrate) navigator.vibrate(200);
      }
    } catch (error) {
      setScanResult({
        success: false,
        error: "Failed to process check-in",
      });
    } finally {
      setProcessing(false);
    }
  };

  const scanAgain = () => {
    setScanResult(null);
    startScanning();
  };

  return (
    <div className="min-h-screen bg-vodafone-red flex flex-col">
      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center justify-between shadow-sm">
        <Logo size="sm" />
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:block">{userName}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-gray-600"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Check-in Counter */}
      <div className="bg-white/10 text-white text-center py-3">
        <span className="text-2xl font-bold">{todayCheckIns}</span>
        <span className="text-white/80 ml-2">checked in</span>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Result Display */}
        {scanResult && (
          <div
            className={`w-full max-w-sm mb-6 p-6 rounded-2xl text-center ${
              scanResult.success
                ? "bg-green-500 text-white"
                : "bg-white text-red-600"
            }`}
          >
            {scanResult.success ? (
              <>
                <CheckCircle2 className="h-16 w-16 mx-auto mb-3" />
                <p className="text-2xl font-bold mb-1">
                  {scanResult.data?.fullName}
                </p>
                <Badge
                  variant={
                    scanResult.data?.ageGroup.toLowerCase() as
                      | "kids"
                      | "youth"
                      | "adult"
                      | "senior"
                  }
                  className="text-sm"
                >
                  {scanResult.data?.ageGroup}
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 mx-auto mb-3" />
                <p className="text-xl font-bold">{scanResult.error}</p>
              </>
            )}
          </div>
        )}

        {/* Camera View */}
        {!scanResult && (
          <div
            ref={containerRef}
            className="w-full max-w-sm aspect-square bg-black rounded-2xl overflow-hidden relative"
          >
            {!scanning && !processing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <Camera className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-white/70">Starting camera...</p>
              </div>
            )}
            {processing && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-white animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* Scan Again Button */}
        {scanResult && (
          <Button
            onClick={scanAgain}
            size="lg"
            className="bg-white text-vodafone-red hover:bg-gray-100 text-lg px-8 py-6 rounded-full"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Scan Next
          </Button>
        )}

        {/* Instructions */}
        {scanning && (
          <p className="text-white/80 text-center mt-4">
            Point camera at QR code
          </p>
        )}
      </div>
    </div>
  );
}
