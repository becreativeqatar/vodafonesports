"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Search,
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
  const [cameraLoading, setCameraLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [todayCheckIns, setTodayCheckIns] = useState(0);
  const [manualCode, setManualCode] = useState("");
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanning = async () => {
    setCameraLoading(true);
    setScanResult(null);

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

      if (!containerRef.current) {
        setCameraLoading(false);
        return;
      }

      // Clear container
      containerRef.current.innerHTML = "";

      const scannerId = "validator-qr-reader";
      const div = document.createElement("div");
      div.id = scannerId;
      containerRef.current.appendChild(div);

      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;

      // Get available cameras first (helps with iOS)
      const cameras = await Html5Qrcode.getCameras();

      if (!cameras || cameras.length === 0) {
        throw new Error("NotFoundError");
      }

      // Prefer back camera
      const backCamera = cameras.find(c =>
        c.label.toLowerCase().includes("back") ||
        c.label.toLowerCase().includes("rear") ||
        c.label.toLowerCase().includes("environment")
      );

      const cameraId = backCamera?.id || cameras[0].id;

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
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

      // Camera started successfully
      setCameraLoading(false);
      setScanning(true);
    } catch (error: any) {
      console.error("Scanner error:", error);
      setCameraLoading(false);
      setScanning(false);

      let message = "Unable to access camera. Please check permissions.";
      if (error?.message?.includes("NotAllowedError") || error?.name === "NotAllowedError") {
        message = "Camera permission denied. Please allow camera access and refresh.";
      } else if (error?.message?.includes("NotFoundError") || error?.name === "NotFoundError") {
        message = "No camera found on this device.";
      } else if (error?.message?.includes("NotReadableError") || error?.name === "NotReadableError") {
        message = "Camera is in use by another application.";
      } else if (error?.message?.includes("NotSupportedError")) {
        message = "Camera not supported. Please use the manual entry below.";
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
    setManualCode("");
    setScanning(false);
    setCameraLoading(false);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode || manualCode.length !== 5) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 5-digit code",
        variant: "destructive",
      });
      return;
    }

    // Stop scanner if running
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // Ignore stop errors
      }
    }
    setScanning(false);

    // Process with SV- prefix
    const fullCode = `SV-${manualCode}`;
    await handleScan(fullCode);
  };

  const handleManualCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, max 5 characters
    const value = e.target.value.replace(/\D/g, "").slice(0, 5);
    setManualCode(value);
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
            {scanResult.success && scanResult.data ? (
              <>
                <CheckCircle2 className="h-16 w-16 mx-auto mb-3" />
                <p className="text-2xl font-bold mb-1">
                  {scanResult.data.fullName}
                </p>
                <Badge
                  variant={
                    (scanResult.data.ageGroup?.toLowerCase() || "adult") as
                      | "kids"
                      | "youth"
                      | "adult"
                      | "senior"
                  }
                  className="text-sm"
                >
                  {scanResult.data.ageGroup}
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
            {!scanning && !cameraLoading && !processing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
                <Camera className="h-16 w-16 mb-4 opacity-50" />
                <Button
                  onClick={startScanning}
                  className="bg-white text-vodafone-red hover:bg-gray-100"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera
                </Button>
              </div>
            )}
            {(cameraLoading || processing) && (
              <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
                <div className="text-center text-white">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-2" />
                  <p className="text-sm opacity-70">
                    {cameraLoading ? "Starting camera..." : "Processing..."}
                  </p>
                </div>
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

        {/* Manual Code Entry */}
        {!scanResult && (
          <form onSubmit={handleManualSubmit} className="w-full max-w-sm mt-6">
            <p className="text-white/80 text-center text-sm mb-2">
              Or enter code manually:
            </p>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center bg-white rounded-lg overflow-hidden">
                <span className="pl-3 pr-1 text-gray-500 font-mono font-bold">
                  SV-
                </span>
                <Input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="00000"
                  value={manualCode}
                  onChange={handleManualCodeChange}
                  className="border-0 font-mono text-lg tracking-wider focus-visible:ring-0 pl-0"
                  maxLength={5}
                />
              </div>
              <Button
                type="submit"
                disabled={processing || manualCode.length !== 5}
                className="bg-white text-vodafone-red hover:bg-gray-100 px-4"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
