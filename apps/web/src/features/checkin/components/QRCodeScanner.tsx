"use client";

/**
 * QR Code Scanner Component
 * 
 * Features:
 * - Manual QR code input (✅ Fully functional)
 * - Camera preview (✅ Fully operational with auto-detection)
 * 
 * Powered by jsqr for real-time edge processing.
 */

import jsQR from "jsqr";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import type { CheckInRequest } from "../types";
import { useCheckIn, useValidateQRCode } from "../hooks/useCheckIn";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { MobileScanner } from "./MobileScanner";
import { DesktopScanner } from "./DesktopScanner";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const t = useTranslations("checkin.scanner");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [checkInResult, setCheckInResult] = useState<{
    success: boolean;
    message: string;
    checkIn?: Record<string, unknown> | null;
  } | null>(null);
  const [manualQRCode, setManualQRCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
  const [isInsecureContext, setIsInsecureContext] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      // Check for secure context (HTTPS or localhost)
      const isLocalhost = Boolean(
        window.location.hostname === "localhost" ||
        window.location.hostname === "[::1]" ||
        window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
      );

      const isSecure = window.isSecureContext || isLocalhost;

      if (!isSecure && !navigator.mediaDevices) {
        setIsInsecureContext(true);
        setHasPermission(false);
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasPermission(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());
        setHasPermission(true);
      } catch (err) {
        console.error("Camera permission error:", err);
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

        // QR code detection using jsqr
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          handleQRCodeProcess(code.data);
        }
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
              message: checkInData.message || t("result.success"),
              checkIn: checkInData.check_in as Record<string, unknown> | null | undefined,
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
            const errorMessage = checkInData?.message || t("result.failed");
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
          const errorMessage = validationData?.message || t("result.invalidQR");
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
          error instanceof Error ? error.message : t("result.error");
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
    [gateId, location, validateQRCode, checkIn, onScanSuccess, onScanError, isProcessing, cleanupStream, resumeScanning, t],
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
    if (isInsecureContext || !navigator.mediaDevices) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);
    } catch {
      setHasPermission(false);
    }
  }, [isInsecureContext]);

  // Handle manual check-in
  const handleManualCheckIn = useCallback(async () => {
    if (!manualQRCode.trim() || isProcessing) return;
    setIsDrawerOpen(false); // Close drawer before processing
    await handleQRCodeProcess(manualQRCode.trim());
    setManualQRCode("");
  }, [manualQRCode, isProcessing, handleQRCodeProcess]);

  const isMobile = useIsMobile();

  if (hasPermission === false) {
    return (
      <div className={cn("w-full max-w-2xl mx-auto p-4", !isMobile && "card-shadow rounded-xl bg-card border")}>
        <div className="space-y-6 text-center py-8">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">
              {isInsecureContext ? t("cameraPermission.insecureContext") : t("cameraPermission.denied")}
            </h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {isInsecureContext ? t("cameraPermission.insecureContextMessage") : t("cameraPermission.deniedMessage")}
            </p>
          </div>
          <Button onClick={requestPermission} size="lg" className="w-full sm:w-auto px-8 cursor-pointer">
            {t("cameraPermission.requestButton")}
          </Button>

          <div className="pt-8 border-t max-w-md mx-auto">
            <div className="flex flex-col gap-4">
              <Input
                type="text"
                value={manualQRCode}
                onChange={(e) => setManualQRCode(e.target.value)}
                placeholder={t("manualInput.placeholder")}
                className="text-center h-12"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isProcessing) {
                    handleManualCheckIn();
                  }
                }}
                disabled={isProcessing}
              />
              <Button
                onClick={handleManualCheckIn}
                disabled={!manualQRCode.trim() || isProcessing}
                className="h-12 cursor-pointer"
              >
                {t("manualInput.button")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasPermission === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
      </div>
    );
  }

  // Delegate to specialized components
  if (isMobile) {
    return (
      <MobileScanner
        videoRef={videoRef}
        canvasRef={canvasRef}
        isScanning={isScanning}
        isProcessing={isProcessing}
        checkInResult={checkInResult}
        manualQRCode={manualQRCode}
        setManualQRCode={setManualQRCode}
        startScanning={startScanning}
        stopScanning={stopScanning}
        handleManualCheckIn={handleManualCheckIn}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
      />
    );
  }

  return (
    <DesktopScanner
      videoRef={videoRef}
      canvasRef={canvasRef}
      isScanning={isScanning}
      isProcessing={isProcessing}
      checkInResult={checkInResult}
      manualQRCode={manualQRCode}
      setManualQRCode={setManualQRCode}
      startScanning={startScanning}
      stopScanning={stopScanning}
      handleManualCheckIn={handleManualCheckIn}
      validatePending={validateQRCode.isPending}
      checkInPending={checkIn.isPending}
    />
  );
}
