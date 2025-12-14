"use client";

/**
 * QR Code Scanner Component
 * 
 * Features:
 * - Manual QR code input (✅ Fully functional)
 * - Camera preview (✅ Ready, QR detection needs jsqr library)
 * 
 * To enable camera-based QR scanning:
 * 1. Install: npm install jsqr
 * 2. Uncomment: import jsQR from "jsqr";
 * 3. Uncomment QR detection code (line ~239)
 * 
 * Manual input works 100% without any additional setup.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { CheckInRequest } from "../types";
import { useCheckIn, useValidateQRCode } from "../hooks/useCheckIn";
import { CheckInResult } from "./CheckInResult";
import { Camera, Loader2, AlertCircle, Scan } from "lucide-react";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [checkInResult, setCheckInResult] = useState<{
    success: boolean;
    message: string;
    checkIn?: unknown;
  } | null>(null);
  const [manualQRCode, setManualQRCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const validateQRCode = useValidateQRCode();
  const checkIn = useCheckIn();

  // Cleanup function for video stream - stable reference
  const cleanupStream = useCallback(() => {
    // Clear resume timeout
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }

    // Clear scan interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    // Clear video element
    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
        videoRef.current.pause();
      } catch (error) {
        // Ignore errors when cleaning up
        console.debug("Error cleaning up video:", error);
      }
    }

    setIsScanning(false);
  }, []); // Empty deps - stable function

  // Check camera permission
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());
        setHasPermission(true);
      } catch {
        setHasPermission(false);
      }
    };

    checkPermission();
  }, []);

  // Start scanning function
  const startScanning = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || hasPermission === false || isProcessing) {
      return;
    }

    // Cleanup any existing stream first
    cleanupStream();

    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Prefer back camera on mobile
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        
        try {
          await videoRef.current.play();
        } catch (playError) {
          // Handle play error gracefully
          console.debug("Video play error:", playError);
          cleanupStream();
          return;
        }
      }

      setIsScanning(true);

      // Start scanning loop
      const scanQRCode = () => {
        if (!videoRef.current || !canvasRef.current || isProcessing) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
          return;
        }

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // QR code detection will be enabled after installing jsqr library
        // For now, manual input is the primary method
        // To enable: install jsqr and uncomment below
        // const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        // const code = jsQR(imageData.data, imageData.width, imageData.height);
        // if (code) {
        //   handleQRCodeProcess(code.data);
        // }
      };

      // Scan every 100ms
      scanIntervalRef.current = setInterval(scanQRCode, 100);
    } catch (error) {
      console.error("Error starting camera:", error);
      setHasPermission(false);
      setIsScanning(false);
    }
  }, [hasPermission, isProcessing, cleanupStream]);

  // Stop scanning function
  const stopScanning = useCallback(() => {
    cleanupStream();
  }, [cleanupStream]);

  // Resume scanning after processing
  const resumeScanning = useCallback(() => {
    if (hasPermission && videoRef.current && canvasRef.current && !isProcessing) {
      startScanning();
    }
  }, [hasPermission, isProcessing, startScanning]);

  // Handle QR code processing
  const handleQRCodeProcess = useCallback(
    async (qrCode: string) => {
      if (isProcessing) return; // Prevent multiple simultaneous processing
      
      setIsProcessing(true);
      setIsScanning(false);

      // Stop scanning temporarily
      cleanupStream();

      // Validate QR code first
      try {
        const validationResult = await validateQRCode.mutateAsync({
          qr_code: qrCode,
        });

        // Service returns ApiResponse<ValidateQRCodeResponse>
        // Structure: {success: true, data: ValidateQRCodeResponse, ...}
        const validationData = validationResult.data;

        if (validationResult.success && validationData?.valid) {
          // Perform check-in
          const checkInRequest: CheckInRequest = {
            qr_code: qrCode,
            gate_id: gateId,
            location: location,
          };

          const checkInResult = await checkIn.mutateAsync(checkInRequest);

          // Service returns ApiResponse<CheckInResultResponse>
          const checkInData = checkInResult.data;

          if (checkInResult.success && checkInData?.success) {
            setCheckInResult({
              success: true,
              message: checkInData.message || "Check-in berhasil",
              checkIn: checkInData.check_in,
            });

            // Vibrate if available
            if (navigator.vibrate) {
              navigator.vibrate(200);
            }

            onScanSuccess?.(qrCode);

            // Resume scanning after 2 seconds
            resumeTimeoutRef.current = setTimeout(() => {
              setCheckInResult(null);
              setIsProcessing(false);
              resumeScanning();
            }, 2000);
          } else {
            // Check-in failed
            const errorMessage = checkInData?.message || "Check-in gagal";
            setCheckInResult({
              success: false,
              message: errorMessage,
            });
            onScanError?.(errorMessage);

            // Resume scanning after 3 seconds
            resumeTimeoutRef.current = setTimeout(() => {
              setCheckInResult(null);
              setIsProcessing(false);
              resumeScanning();
            }, 3000);
          }
        } else {
          // Validation failed
          const errorMessage = validationData?.message || "QR code tidak valid";
          setCheckInResult({
            success: false,
            message: errorMessage,
          });
          onScanError?.(errorMessage);

          // Resume scanning after 2 seconds
          resumeTimeoutRef.current = setTimeout(() => {
            setCheckInResult(null);
            setIsProcessing(false);
            resumeScanning();
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

        // Resume scanning after 2 seconds
        resumeTimeoutRef.current = setTimeout(() => {
          setCheckInResult(null);
          setIsProcessing(false);
          resumeScanning();
        }, 2000);
      }
    },
    [gateId, location, validateQRCode, checkIn, onScanSuccess, onScanError, isProcessing, cleanupStream, resumeScanning],
  );

  // Store cleanup function in ref to avoid stale closure
  const cleanupStreamRef = useRef(cleanupStream);
  useEffect(() => {
    cleanupStreamRef.current = cleanupStream;
  }, [cleanupStream]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      // Use ref to get latest cleanup function
      cleanupStreamRef.current();
    };
  }, []); // Empty deps - only run on mount/unmount

  // Request camera permission
  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);
    } catch {
      setHasPermission(false);
    }
  }, []);

  // Handle manual check-in
  const handleManualCheckIn = useCallback(async () => {
    if (!manualQRCode.trim() || isProcessing) return;
    await handleQRCodeProcess(manualQRCode.trim());
    setManualQRCode("");
  }, [manualQRCode, isProcessing, handleQRCodeProcess]);

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
                  if (e.key === "Enter" && !isProcessing) {
                    handleManualCheckIn();
                  }
                }}
                disabled={isProcessing}
              />
              <Button 
                onClick={handleManualCheckIn} 
                disabled={!manualQRCode.trim() || isProcessing || validateQRCode.isPending || checkIn.isPending}
              >
                {validateQRCode.isPending || checkIn.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Check-in"
                )}
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
            Arahkan kamera ke QR code pada tiket atau masukkan QR code secara manual
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Camera Preview */}
          <div
            ref={containerRef}
            className="w-full min-h-[400px] bg-black rounded-lg overflow-hidden relative"
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Scanning overlay */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-green-500 rounded-lg w-64 h-64 flex items-center justify-center">
                  <Scan className="h-8 w-8 text-green-500 animate-pulse" />
                </div>
              </div>
            )}

            {/* Placeholder when not scanning */}
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center space-y-4">
                  <Camera className="h-16 w-16 mx-auto opacity-50" />
                  <p className="text-sm opacity-75">
                    {hasPermission ? "Kamera siap untuk scanning" : "Aktifkan kamera untuk scanning"}
                  </p>
                  {hasPermission && (
                    <Button
                      onClick={startScanning}
                      variant="outline"
                      className="mt-4"
                      disabled={isProcessing}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Start Camera
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Stop button when scanning */}
            {isScanning && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <Button
                  onClick={stopScanning}
                  variant="destructive"
                  size="sm"
                >
                  Stop Scanning
                </Button>
              </div>
            )}
          </div>

          {/* Manual QR Code Input */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2 font-medium">
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
                  if (e.key === "Enter" && !isProcessing) {
                    handleManualCheckIn();
                  }
                }}
                disabled={isProcessing}
              />
              <Button 
                onClick={handleManualCheckIn} 
                disabled={!manualQRCode.trim() || isProcessing || validateQRCode.isPending || checkIn.isPending}
              >
                {validateQRCode.isPending || checkIn.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Check-in"
                )}
              </Button>
            </div>
            {isProcessing && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Memproses check-in...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
