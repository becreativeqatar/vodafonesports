"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QRDisplay } from "@/components/public/qr-display";
import { CheckCircle2, Calendar, Download, Share2, Mail, Printer, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function SuccessContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const id = searchParams.get("id") || "";
  const qrCode = searchParams.get("qrCode") || "";
  const fullName = searchParams.get("fullName") || "";
  const email = searchParams.get("email") || "";

  // Check if Web Share API is available
  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  useEffect(() => {
    // Generate QR code data URL on the client with higher resolution
    const generateQR = async () => {
      const QRCode = (await import("qrcode")).default;
      const dataUrl = await QRCode.toDataURL(qrCode, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrDataUrl(dataUrl);
    };

    if (qrCode) {
      generateQR();
    }
  }, [qrCode]);

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.download = `sports-village-${qrCode}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handleAddToCalendar = () => {
    const event = {
      title: "Sports Village - National Sport Day 2026",
      start: "20260210T073000",
      end: "20260210T163000",
      location: "Downtown Msheireb, Barahat Msheireb, Doha, Qatar",
      description: `Your registration ID: ${id}\nQR Code: ${qrCode}`,
    };

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${event.start}/${event.end}&location=${encodeURIComponent(
      event.location
    )}&details=${encodeURIComponent(event.description)}`;

    window.open(url, "_blank");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Sports Village 2026",
          text: `I'm registered for Sports Village - National Sport Day 2026! Join me at Downtown Msheireb, Qatar.`,
          url: window.location.origin,
        });
      } catch (error) {
        // User cancelled or share failed - ignore
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyQR = async () => {
    if (!qrDataUrl) return;

    try {
      // Convert data URL to blob
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();

      // Try to copy image to clipboard
      if (navigator.clipboard && "write" in navigator.clipboard) {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
        setCopied(true);
        toast({
          title: "Copied!",
          description: "QR code copied to clipboard",
        });
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback: copy the QR code text
        await navigator.clipboard.writeText(qrCode);
        setCopied(true);
        toast({
          title: "Copied!",
          description: "QR code text copied to clipboard",
        });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      // Fallback: copy the QR code text
      try {
        await navigator.clipboard.writeText(qrCode);
        setCopied(true);
        toast({
          title: "Copied!",
          description: "QR code text copied to clipboard",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast({
          title: "Copy failed",
          description: "Unable to copy to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  if (!qrCode) {
    return (
      <div className="py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-vodafone-grey mb-4">
            Invalid Registration
          </h1>
          <p className="text-gray-600 mb-6">
            No registration data found. Please register again.
          </p>
          <Button asChild>
            <Link href="/register">Register Now</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary-spring-green/20 rounded-full mb-6">
              <CheckCircle2 className="h-10 w-10 text-secondary-spring-green" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-vodafone-grey mb-4">
              Registration Confirmed!
            </h1>
            <p className="text-gray-600">
              Thank you for registering, <strong>{fullName}</strong>. Your QR
              code has been sent to <strong>{email}</strong>.
            </p>
          </div>

          {/* QR Code Card */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="text-center">
                <QRDisplay qrCode={qrCode} qrDataUrl={qrDataUrl} />

                <div className="flex flex-wrap items-center justify-center gap-3 mt-6 print:hidden">
                  <Button onClick={handleDownload} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button onClick={handleCopyQR} variant="outline">
                    {copied ? (
                      <Check className="mr-2 h-4 w-4 text-secondary-spring-green" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button onClick={handlePrint} variant="outline" className="print:hidden">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button onClick={handleAddToCalendar} variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Calendar
                  </Button>
                  {canShare && (
                    <Button onClick={handleShare} variant="outline">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="font-semibold text-lg mb-4">Event Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Event</span>
                  <span className="font-medium">
                    Sports Village - National Sport Day 2026
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium">Tuesday, 10 February 2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time</span>
                  <span className="font-medium">7:30 AM - 4:30 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium text-right">
                    Downtown Msheireb, Barahat Msheireb
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="border-l-4 border-l-vodafone-red bg-red-50">
            <CardContent className="pt-6">
              <h2 className="font-semibold text-lg mb-3">Important</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 text-vodafone-red" />
                  <span>
                    A confirmation email with your QR code has been sent to{" "}
                    <strong>{email}</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-vodafone-red" />
                  <span>
                    Please bring this QR code (printed or on your phone) to the
                    event
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-vodafone-red" />
                  <span>
                    Present your QR code at the entrance for quick check-in
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="text-center mt-8 print:hidden">
            <Button asChild variant="link">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
