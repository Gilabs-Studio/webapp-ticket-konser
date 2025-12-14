"use client";

/**
 * QR Code Scanner Component
 * 
 * NOTE: Install html5-qrcode library first:
 * npm install html5-qrcode
 * 
 * Then uncomment the import below and update the component accordingly.
 */
// import { Html5QrcodeScanner } from "html5-qrcode";

import { useEffect, useRef, useState, useCallback } from "react";
import type { CheckInRequest } from "../types";
import { useCheckIn, useValidateQRCode } from "../hooks/useCheckIn";
import { CheckInResult } from "./CheckInResult";
import { Camera, Loader2, AlertCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

interface QRCodeScannerProps {
  readonly gateId?: string;
  readonly location?: string;
  readonly onScanSuccess?: (qrCode: string) => void;
  readonly onScanError?: (error: string) => void;
}

export function QRCodeScanner({
  gateId,
  location,
  onScanSuccess,
  onScanError,
}: QRCodeScannerProps) {
  // TODO: Uncomment after installing html5-qrcode
  // const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedQRCode, setScannedQRCode] = useState<string | null>(null);
  const [checkInResult, setCheckInResult] = useState<{
    success: boolean;
    message: string;
    checkIn?: unknown;
  } | null>(null);
  const [manualQRCode, setManualQRCode] = useState("");

  const validateQRCode = useValidateQRCode();
  const checkIn = useCheckIn();

  // Check camera permission
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());
        setHasPermission(true);
      } catch (error) {
        setHasPermission(false);
      }
    };

    checkPermission();
  }, []);

  const handleQRCodeProcess = useCallback(
    async (qrCode: string) => {
      setScannedQRCode(qrCode);
      setIsScanning(false);

      // Validate QR code first
      try {
        const validationResult = await validateQRCode.mutateAsync({
          qr_code: qrCode,
        });

        if (validationResult.success && validationResult.data.valid) {
          // Perform check-in
          const checkInRequest: CheckInRequest = {
            qr_code: qrCode,
            gate_id: gateId,
            location: location,
          };

          const checkInResult = await checkIn.mutateAsync(checkInRequest);

          if (checkInResult.success && checkInResult.data.success) {
            setCheckInResult({
              success: true,
              message: checkInResult.data.message || "Check-in berhasil",
              checkIn: checkInResult.data.check_in,
            });

            // Vibrate if available
            if (navigator.vibrate) {
              navigator.vibrate(200);
            }

            onScanSuccess?.(qrCode);

            // Clear result after 2 seconds
            setTimeout(() => {
              setCheckInResult(null);
              setScannedQRCode(null);
            }, 2000);
          } else {
            setCheckInResult({
              success: false,
              message: checkInResult.data.message || "Check-in gagal",
            });
            onScanError?.(checkInResult.data.message || "Check-in gagal");

            // Clear result after 3 seconds
            setTimeout(() => {
              setCheckInResult(null);
              setScannedQRCode(null);
            }, 3000);
          }
        } else {
          const errorMessage =
            validationResult.data.message || "QR code tidak valid";
          setCheckInResult({
            success: false,
            message: errorMessage,
          });
          onScanError?.(errorMessage);

          // Clear result after 2 seconds
          setTimeout(() => {
            setCheckInResult(null);
            setScannedQRCode(null);
          }, 2000);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Terjadi kesalahan";
        setCheckInResult({
          success: false,
          message: errorMessage,
        });
        onScanError?.(errorMessage);

        // Clear result after 2 seconds
        setTimeout(() => {
          setCheckInResult(null);
          setScannedQRCode(null);
        }, 2000);
      }
    },
    [gateId, location, validateQRCode, checkIn, onScanSuccess, onScanError],
  );

  // Initialize scanner (will be implemented after html5-qrcode is installed)
  useEffect(() => {
    if (!containerRef.current || hasPermission === false) return;

    // TODO: Uncomment and implement after installing html5-qrcode
    /*
    const scannerId = "qr-scanner";
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      disableFlip: false,
    };

    const scanner = new Html5QrcodeScanner(
      scannerId,
      config,
      false, // verbose
    );

    scannerRef.current = scanner;
    setIsScanning(true);

    scanner.render(handleQRCodeProcess, (error: string) => {
      // Ignore common scan errors
      if (
        !error.includes("NotFoundException") &&
        !error.includes("No QR code found")
      ) {
        console.warn("QR scan error:", error);
      }
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((error: unknown) => {
            console.error("Error clearing scanner:", error);
          });
      }
    };
    */
  }, [hasPermission, handleQRCodeProcess]);

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);
    } catch (error) {
      setHasPermission(false);
    }
  };

  const handleManualCheckIn = async () => {
    if (!manualQRCode.trim()) return;
    await handleQRCodeProcess(manualQRCode.trim());
    setManualQRCode("");
  };

  if (hasPermission === false) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Camera Permission Required
          </CardTitle>
          <CardDescription>
            Kami memerlukan akses kamera untuk scan QR code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Permission Denied</AlertTitle>
            <AlertDescription>
              Silakan berikan izin akses kamera untuk menggunakan scanner.
            </AlertDescription>
          </Alert>
          <Button onClick={requestPermission} className="w-full">
            Request Camera Permission
          </Button>
          
          {/* Manual QR Code Input as Fallback */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Atau masukkan QR code secara manual:
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                value={manualQRCode}
                onChange={(e) => setManualQRCode(e.target.value)}
                placeholder="Masukkan QR code..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleManualCheckIn();
                  }
                }}
              />
              <Button onClick={handleManualCheckIn} disabled={!manualQRCode.trim()}>
                Check-in
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasPermission === null) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {checkInResult && (
        <CheckInResult
          success={checkInResult.success}
          message={checkInResult.message}
          checkIn={checkInResult.checkIn}
        />
      )}

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            QR Code Scanner
          </CardTitle>
          <CardDescription>
            Arahkan kamera ke QR code pada tiket
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder until html5-qrcode is installed */}
          <Alert className="mb-4">
            <Package className="h-4 w-4" />
            <AlertTitle>Scanner Setup Required</AlertTitle>
            <AlertDescription>
              Install html5-qrcode library untuk mengaktifkan scanner:
              <br />
              <code className="text-xs mt-2 block bg-muted p-2 rounded">
                npm install html5-qrcode
              </code>
            </AlertDescription>
          </Alert>

          <div
            ref={containerRef}
            id="qr-scanner"
            className="w-full min-h-[400px] bg-black rounded-lg overflow-hidden flex items-center justify-center"
          >
            <div className="text-white text-center space-y-4">
              <Camera className="h-16 w-16 mx-auto opacity-50" />
              <p className="text-sm opacity-75">
                Scanner akan aktif setelah html5-qrcode diinstall
              </p>
            </div>
          </div>

          {/* Manual QR Code Input as Fallback */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Atau masukkan QR code secara manual:
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                value={manualQRCode}
                onChange={(e) => setManualQRCode(e.target.value)}
                placeholder="Masukkan QR code..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleManualCheckIn();
                  }
                }}
              />
              <Button 
                onClick={handleManualCheckIn} 
                disabled={!manualQRCode.trim() || validateQRCode.isPending || checkIn.isPending}
              >
                {validateQRCode.isPending || checkIn.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Check-in"
                )}
              </Button>
            </div>
          </div>

          {isScanning && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Scanning...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

