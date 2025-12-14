"use client";

import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface CheckInResultProps {
  readonly success: boolean;
  readonly message: string;
  readonly checkIn?: unknown;
}

export function CheckInResult({ success, message, checkIn }: CheckInResultProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          className={`w-full ${
            success
              ? "border-green-500 bg-green-50 dark:bg-green-950"
              : "border-red-500 bg-red-50 dark:bg-red-950"
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {success ? (
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              )}
              <div className="flex-1">
                <p
                  className={`font-semibold ${
                    success
                      ? "text-green-900 dark:text-green-100"
                      : "text-red-900 dark:text-red-100"
                  }`}
                >
                  {message}
                </p>
                {checkIn && success && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Check-in berhasil dicatat
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

