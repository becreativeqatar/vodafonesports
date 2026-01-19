"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface QRDisplayProps {
  qrCode: string;
  qrDataUrl?: string;
}

export function QRDisplay({ qrCode, qrDataUrl }: QRDisplayProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="p-4 bg-white rounded-lg border-4 border-vodafone-red">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`QR Code: ${qrCode}`}
            width={200}
            height={200}
            className="block"
          />
        ) : (
          <Skeleton className="w-[200px] h-[200px]" />
        )}
      </div>
      <p className="mt-4 text-xl font-mono font-bold text-vodafone-red">
        {qrCode}
      </p>
      <p className="text-sm text-gray-500 mt-1">
        Show this QR code at the event entrance
      </p>
    </div>
  );
}
