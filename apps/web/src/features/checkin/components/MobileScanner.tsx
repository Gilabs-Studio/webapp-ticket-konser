"use client";

import { Keyboard, Loader2, Scan, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer } from "@/components/ui/drawer";
import { CheckInResult } from "./CheckInResult";

interface MobileScannerProps {
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
  readonly isDrawerOpen: boolean;
  readonly setIsDrawerOpen: (open: boolean) => void;
}

export function MobileScanner({
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
  isDrawerOpen,
  setIsDrawerOpen,
}: MobileScannerProps) {
  // Mobile UI States:
  // 1. Idle: Huge button, no camera, clean text.
  // 2. Scanning: Full screen camera, minimalist overlay, no overlapping text.
  // 3. Result: Notification at top, camera still behind (paused or blurred).

  return (
    <div className="fixed inset-0 bg-[#000000] z-50 flex flex-col font-sans overflow-hidden text-white">
      {/* 1. Immersive Camera Feed (Only visible when scanning) */}
      <div className={isScanning ? "absolute inset-0 z-0 opacity-60" : "hidden"}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* 2. Top Layer: Result Notifications */}
      {checkInResult && (
        <div className="absolute inset-x-0 top-0 z-50 p-6 pt-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-[#121212] rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            <CheckInResult
              success={checkInResult.success}
              message={checkInResult.message}
              checkIn={checkInResult.checkIn}
            />
          </div>
        </div>
      )}

      {/* 3. Middle Layer: Refined Viewfinder */}
      {isScanning && !isProcessing && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none p-8">
          <div className="relative w-full aspect-square max-w-[280px]">
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl" />
            
            {/* Elegant Scan Line */}
            <div className="absolute top-1/2 left-6 right-6 h-[3px] bg-blue-500/80 shadow-[0_0_25px_#3b82f6] animate-scan-line rounded-full" />
            
            {/* Scanning Glow */}
            <div className="absolute inset-0 bg-blue-500/5 animate-pulse rounded-2xl" />
          </div>
          
          <div className="mt-10 bg-neutral-900/60 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/10 shadow-lg">
             <p className="text-[12px] text-white font-medium tracking-widest">Scanning... 100%</p>
          </div>
        </div>
      )}

      {/* 4. Main UI Content */}
      <div className="flex-1 flex flex-col relative z-20 pb-12 px-6">
        {(() => {
          if (!isScanning && !isProcessing) {
            return (
              // IDLE STATE: Refined Landing
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto border border-blue-500/30">
                    <Scan className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <h1 className="text-white font-bold text-3xl tracking-tight">Staff Terminal</h1>
                    <p className="text-white/40 text-sm mt-2">Ready to validate credentials</p>
                  </div>
                </div>
                
                <button
                  onClick={startScanning}
                  className="w-48 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all active:scale-95 cursor-pointer font-bold text-lg"
                >
                  <Scan className="w-5 h-5 mr-3" />
                  Start scan
                </button>

                <div className="pt-4">
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="flex items-center gap-3 text-sm font-medium text-white/30 hover:text-white transition-colors cursor-pointer bg-white/5 py-3 px-6 rounded-2xl border border-white/5"
                  >
                    <Keyboard className="w-4 h-4" />
                    Manual Entry
                  </button>
                </div>
              </div>
            );
          }

          if (isScanning) {
            return (
              // SCANNING STATE: Floating Bottom Control Bar
              <div className="mt-auto flex justify-center pb-8">
                <div className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-[40px] p-2.5 flex items-center gap-2 shadow-2xl">
                   <button 
                    onClick={() => setIsDrawerOpen(true)}
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                   >
                     <Keyboard className="w-6 h-6" />
                   </button>
                   
                   <button 
                    onClick={stopScanning}
                    className="w-20 h-20 rounded-[30px] bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-90 cursor-pointer"
                   >
                     <Scan className="w-8 h-8" />
                   </button>

                   <button 
                    onClick={stopScanning}
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                   >
                     <X className="w-6 h-6" />
                   </button>
                </div>
              </div>
            );
          }

          if (isProcessing) {
            return (
              // PROCESSING STATE
              <div className="flex-1 flex flex-col items-center justify-center">
                 <div className="p-8 rounded-[40px] bg-white/5 backdrop-blur-xl border border-white/10">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                 </div>
                 <p className="text-white font-medium mt-8 text-sm text-white/60 tracking-wide">Validating ticket...</p>
              </div>
            );
          }

          return null;
        })()}
      </div>

      {/* Footer Connectivity status */}
      <div className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-2 pointer-events-none opacity-40">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
        <p className="text-[8px] text-white font-bold tracking-[0.2em] uppercase">Secure Gate Connection</p>
      </div>

      {/* Manual Entry Drawer - High End Aesthetic */}
      <Drawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        side="bottom"
        className="bg-neutral-900 border-white/5 text-white rounded-t-[40px] pb-10"
        title="Manual Entry"
        description="Enter the ticket number manually"
      >
        <div className="space-y-6 pt-6 px-4">
          <div className="relative">
            <Input
              type="text"
              value={manualQRCode}
              onChange={(e) => setManualQRCode(e.target.value)}
              placeholder="Enter Ticket Code"
              className="h-20 rounded-[30px] bg-white/5 border-white/10 text-white placeholder:text-white/20 text-center text-2xl font-semibold focus:ring-2 focus:ring-blue-500/50 transition-all"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isProcessing) {
                  handleManualCheckIn();
                }
              }}
              autoFocus
            />
          </div>
          <Button 
            onClick={handleManualCheckIn} 
            disabled={!manualQRCode.trim() || isProcessing}
            className="w-full h-16 rounded-[30px] font-bold text-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            Verify Ticket
          </Button>
        </div>
      </Drawer>
    </div>
  );
}
