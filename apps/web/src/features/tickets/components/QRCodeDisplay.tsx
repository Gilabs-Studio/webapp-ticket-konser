"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface QRCodeDisplayProps {
  readonly qrCode: string;
  readonly size?: number;
  readonly className?: string;
}

/**
 * QRCodeDisplay component
 * Displays a QR code using an online QR code API
 * 
 * Note: For production, consider using a library like:
 * - qrcode.react
 * - react-qr-code
 * - qrcode.js
 */
export function QRCodeDisplay({
  qrCode,
  size = 200,
  className,
}: QRCodeDisplayProps) {
  // Generate QR code URL using an online service
  // Using qr-server.com API (free, no API key required)
  const qrCodeUrl = useMemo(() => {
    const encoded = encodeURIComponent(qrCode);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;
  }, [qrCode, size]);

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <img
            src={qrCodeUrl}
            alt={`QR Code: ${qrCode}`}
            width={size}
            height={size}
            className="border-2 border-border rounded-md"
          />
          <p className="text-xs text-muted-foreground font-mono break-all text-center max-w-[200px]">
            {qrCode}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}




