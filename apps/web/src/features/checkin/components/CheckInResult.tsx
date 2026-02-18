"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CheckInResultProps {
  readonly success: boolean;
  readonly message: string;
  readonly checkIn?: Record<string, unknown> | null;
}

export function CheckInResult({ success, message, checkIn }: CheckInResultProps) {
  const t = useTranslations("checkin.scanner.result");
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        <div className="flex flex-col items-center gap-3 py-6">
          <div className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center mb-2",
            success ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"
          )}>
            {success ? (
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            ) : (
              <XCircle className="h-8 w-8 text-red-500" />
            )}
          </div>
          <div className="text-center space-y-1">
            <p className={cn(
              "text-xl font-bold tracking-tight",
              success ? "text-white" : "text-red-500"
            )}>
              {message}
            </p>
            {checkIn != null && success && (
              <p className="text-sm text-white/60 font-medium">
                {t("recorded")}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

