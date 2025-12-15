"use client";

import { QRCodeScanner } from "@/features/checkin/components/QRCodeScanner";

export function ScannerPageClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">QR Code Scanner</h1>
        <p className="text-muted-foreground mt-2">
          Scan QR code dari tiket untuk melakukan check-in
        </p>
      </div>

      <QRCodeScanner />
    </div>
  );
}
