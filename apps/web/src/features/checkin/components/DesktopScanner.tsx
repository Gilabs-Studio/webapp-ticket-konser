"use client";

import { Camera, Loader2, Scan, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CheckInResult } from "./CheckInResult";

interface DesktopScannerProps {
  readonly videoRef: React.RefObject<HTMLVideoElement | null>;
  readonly canvasRef: React.RefObject<HTMLCanvasElement | null>;
  readonly isScanning: boolean;
  readonly isProcessing: boolean;
  readonly checkInResult: {
    success: boolean;
    message: string;
    checkIn?: Record<string, unknown> | null;
  } | null;
  readonly manualQRCode: string;
  readonly setManualQRCode: (value: string) => void;
  readonly startScanning: () => void;
  readonly stopScanning: () => void;
  readonly handleManualCheckIn: () => void;
  readonly validatePending: boolean;
  readonly checkInPending: boolean;
}

export function DesktopScanner({
  videoRef,
  canvasRef,
  isScanning,
  isProcessing,
  checkInResult,
  manualQRCode,
  setManualQRCode,
  startScanning,
  stopScanning,
  handleManualCheckIn,
  validatePending,
  checkInPending,
}: DesktopScannerProps) {
  return (
    <div className="w-full max-w-6xl mx-auto p-6 animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Camera Stage (8/12) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative aspect-video bg-muted/20 rounded-4xl overflow-hidden border border-border/50 group transition-all duration-500">
            <video
              ref={videoRef}
              className="w-full h-full object-cover opacity-90 transition-opacity duration-700 group-hover:opacity-100"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Minimalist Viewfinder Overlay */}
            {isScanning && (
              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <div className="relative w-48 h-48 border border-primary/20 rounded-3xl backdrop-blur-[2px]">
                   <div className="absolute inset-0 border-2 border-primary/30 rounded-3xl animate-pulse" />
                   <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-primary/40 shadow-[0_0_15px_rgba(var(--primary),0.3)] animate-scan-line" />
                </div>
              </div>
            )}

            {!isScanning && !isProcessing && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/60 backdrop-blur-md">
                <div className="w-20 h-20 bg-background rounded-3xl flex items-center justify-center mb-8 border border-border shadow-sm group-hover:scale-105 transition-transform duration-500">
                  <Camera className="h-8 w-8 text-primary/60" />
                </div>
                <Button
                  onClick={startScanning}
                  size="lg"
                  className="rounded-full px-10 h-12 text-sm shadow-md transition-all cursor-pointer font-bold uppercase tracking-widest"
                >
                  <Scan className="mr-2 h-4 w-4" />
                  Initialize Camera
                </Button>
              </div>
            )}

            {isScanning && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <Button
                  onClick={stopScanning}
                  variant="secondary"
                  className="rounded-full px-8 bg-background/80 border border-border backdrop-blur-xl hover:bg-destructive hover:text-destructive-foreground transition-all cursor-pointer h-10 text-[10px] font-bold uppercase tracking-widest"
                >
                  Deactivate Scanner
                </Button>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 z-30 bg-background/80 backdrop-blur-xl flex flex-col items-center justify-center">
                 <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
                 <p className="text-sm font-bold mt-6 tracking-[0.2em] uppercase text-muted-foreground">Validating Ticket</p>
              </div>
            )}
          </div>
        </div>

        {/* Minimalist Sidebar (4/12) */}
        <div className="lg:col-span-4 flex flex-col gap-10 py-2">
          {/* Status Section */}
          <div className="space-y-6 min-h-[160px] flex flex-col justify-center">
            {checkInResult ? (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <CheckInResult
                  success={checkInResult.success}
                  message={checkInResult.message}
                  checkIn={checkInResult.checkIn}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <div className={cn(
                     "w-2 h-2 rounded-full",
                     isScanning ? "bg-green-500 animate-pulse" : "bg-muted-foreground/30"
                   )} />
                   <h3 className="text-xl font-bold tracking-tight">Scanner Terminal</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {isScanning 
                    ? "System active. Place the QR Code within the markers to trigger validation." 
                    : "Camera inactive. Activate to begin scanning visitor credentials."}
                </p>
              </div>
            )}
          </div>

          <div className="h-px bg-border/40 w-full" />

          {/* Manual Entry Section */}
          <div className="space-y-6">
            <div className="space-y-1">
              <h4 className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground/60">Manual Override</h4>
            </div>
            <div className="space-y-4">
              <div className="relative group">
                <Input
                  type="text"
                  value={manualQRCode}
                  onChange={(e) => setManualQRCode(e.target.value)}
                  placeholder="Enter ticket code"
                  className="h-12 rounded-xl bg-muted/30 border border-border/60 px-5 text-sm font-medium focus-visible:ring-primary/10 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isProcessing) {
                      handleManualCheckIn();
                    }
                  }}
                  disabled={isProcessing}
                />
                <div className="absolute right-1.5 top-1.5 bottom-1.5">
                  <Button 
                    onClick={handleManualCheckIn} 
                    disabled={!manualQRCode.trim() || isProcessing || validatePending || checkInPending}
                    className="h-full px-4 rounded-lg cursor-pointer text-[10px] font-bold uppercase tracking-wider"
                    variant="ghost"
                  >
                    {validatePending || checkInPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Process"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Operator Note - Subtle */}
          <div className="pt-4">
            <div className="flex items-center gap-3 px-1">
              <AlertCircle className="h-4 w-4 text-muted-foreground/40" />
              <p className="text-[10px] text-muted-foreground/50 font-medium leading-relaxed uppercase tracking-tighter">
                Keep device stable for 100% accurate read speed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
