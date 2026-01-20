"use client";

import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  CheckCircle2,
  XCircle,
  Loader2,
  LogOut,
  RotateCcw,
  Search,
  AlertTriangle,
} from "lucide-react";

// Error boundary to catch rendering errors
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ValidatorErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Validator error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-vodafone-red flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">Please refresh the page to try again.</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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

function ValidatorScannerInner({ userName }: ValidatorScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [todayCheckIns, setTodayCheckIns] = useState(0);
  const [manualCode, setManualCode] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simple toast replacement for debugging
  const toast = ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    setToastMessage(`${title}: ${description}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch today's check-in count
  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/registrations?status=CHECKED_IN&limit=1");
        if (!mounted) return;
        const data = await response.json();
        if (mounted && data?.success) {
          setTodayCheckIns(data?.data?.pagination?.total ?? 0);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();
    return () => { mounted = false; };
  }, [scanResult]);

  // Auto-start camera on mount
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      startScanning();
    }, 500);

    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(() => {});
        } catch {
          // Ignore
        }
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

      // Dynamic import
      const html5QrcodeModule = await import("html5-qrcode");
      const Html5Qrcode = html5QrcodeModule.Html5Qrcode;

      // Use fixed ID that's already in the DOM
      const scannerId = "validator-qr-reader";

      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;

      // Use facingMode instead of camera ID for better iOS compatibility
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          // Make qrbox fill 85% of the viewfinder
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const size = Math.floor(minEdge * 0.85);
            return { width: size, height: size };
          },
          aspectRatio: 1,
        },
        (decodedText) => {
          // Success callback
          scanner.stop().then(() => {
            setScanning(false);
            handleScan(decodedText);
          }).catch(() => {
            setScanning(false);
            handleScan(decodedText);
          });
        },
        () => {
          // Error callback - ignore scan errors
        }
      );

      // Camera started successfully
      setCameraLoading(false);
      setScanning(true);
    } catch (error: any) {
      console.error("Scanner error:", error);
      setCameraLoading(false);
      setScanning(false);

      let message = "Unable to access camera. Use manual entry below.";
      if (error?.message?.includes("NotAllowedError") || error?.name === "NotAllowedError") {
        message = "Camera permission denied. Please allow camera access and refresh.";
      } else if (error?.message?.includes("NotFoundError") || error?.name === "NotFoundError") {
        message = "No camera found. Use manual entry below.";
      } else if (error?.message?.includes("NotReadableError") || error?.name === "NotReadableError") {
        message = "Camera is in use by another app.";
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

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const response = await fetch("/api/validation/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const result = await response.json();
      setScanResult(result);

      if (result.success) {
        // Play success sound/vibrate (skip on iOS - not supported)
        try {
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(200);
          }
        } catch {
          // Ignore vibration errors
        }
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      const errorMessage = error?.name === "AbortError"
        ? "Request timed out. Please try again."
        : "Failed to process check-in";
      setScanResult({
        success: false,
        error: errorMessage,
      });
    } finally {
      setProcessing(false);
    }
  };

  const scanAgain = () => {
    setScanResult(null);
    setManualCode("");
    // Auto-restart camera
    startScanning();
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

  const handleLogout = () => {
    window.location.href = "/api/auth/signout";
  };

  return (
    <div className="min-h-screen bg-vodafone-red flex flex-col">
      {/* Toast Message */}
      {toastMessage && (
        <div className="fixed top-4 left-4 right-4 bg-black text-white p-3 rounded-lg z-50 text-center">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="font-bold text-vodafone-red">Sports Village</div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:block">{userName || "Validator"}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
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
          <div className="w-full max-w-sm aspect-square bg-black rounded-2xl overflow-hidden relative">
            {/* Scanner container - must have fixed ID for html5-qrcode */}
            <div id="validator-qr-reader" className="w-full h-full" />

            {/* Overlay for start button */}
            {!scanning && !cameraLoading && !processing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 bg-black">
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

            {/* Loading overlay */}
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

// Export wrapped version with error boundary
export function ValidatorScanner(props: ValidatorScannerProps) {
  return (
    <ValidatorErrorBoundary>
      <ValidatorScannerInner {...props} />
    </ValidatorErrorBoundary>
  );
}
