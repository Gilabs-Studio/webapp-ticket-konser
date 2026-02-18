"use client";

import { useMemo, useState } from "react";
import { QRCodeScanner } from "@/features/checkin/components/QRCodeScanner";
import { useMyGatesEnabled } from "@/features/gate/hooks/useGates";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { getNormalizedRoleCode } from "@/features/auth/utils/role";

export function ScannerPageClient() {
  const { user } = useAuthStore();
  const userRole = getNormalizedRoleCode(user?.role);
  const isAdmin = ["admin", "super_admin"].includes(userRole);

  const { data, isLoading, isError } = useMyGatesEnabled(!isAdmin);
  const gates = useMemo(() => data?.data ?? [], [data]);

  const [selectedGateId, setSelectedGateId] = useState<string>("");

  // Auto-select the only available gate when there is exactly one
  const effectiveGateId = gates.length === 1 ? (gates[0]?.id ?? "") : selectedGateId;

  const selectedGate = useMemo(
    () => gates.find((g) => g.id === effectiveGateId),
    [gates, effectiveGateId],
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QR Code Scanner</h1>
          <p className="text-muted-foreground mt-2">
            Scan QR code dari tiket untuk melakukan check-in
          </p>
        </div>

        {isAdmin && <QRCodeScanner />}

        {!isAdmin && (
          <>
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memuat gate...</span>
              </div>
            )}

            {isError && (
              <Alert variant="destructive">
                <AlertTitle>Gagal memuat gate</AlertTitle>
                <AlertDescription>
                  Tidak bisa mengambil daftar gate yang di-assign untuk akun ini.
                </AlertDescription>
              </Alert>
            )}

            {!isLoading && !isError && gates.length === 0 && (
              <Alert variant="destructive">
                <AlertTitle>Belum ada gate</AlertTitle>
                <AlertDescription>
                  Akun ini belum di-assign ke gate mana pun. Hubungi admin untuk
                  meng-assign gate.
                </AlertDescription>
              </Alert>
            )}

            {!isLoading && !isError && gates.length > 1 && (
              <Select value={effectiveGateId} onValueChange={setSelectedGateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih gate untuk scan" />
                </SelectTrigger>
                <SelectContent>
                  {gates.map((gate) => (
                    <SelectItem key={gate.id} value={gate.id}>
                      {gate.name} ({gate.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {!!effectiveGateId && (
              <QRCodeScanner
                gateId={effectiveGateId}
                location={selectedGate?.location ?? undefined}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
