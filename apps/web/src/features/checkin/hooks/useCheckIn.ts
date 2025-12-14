import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checkInService } from "../services/checkInService";
import type {
  CheckInFilters,
  CheckInRequest,
  ValidateQRCodeRequest,
} from "../types";
import { toast } from "sonner";

/**
 * Hook untuk validasi QR code
 */
export function useValidateQRCode() {
  return useMutation({
    mutationFn: (request: ValidateQRCodeRequest) =>
      checkInService.validateQRCode(request),
    onSuccess: (response) => {
      // Don't show success toast for validation - it's just a check
      // Only show error if validation fails
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      const message =
        err.response?.data?.error?.message || "Gagal validasi QR code";
      toast.error("Validasi Gagal", {
        description: message,
      });
    },
  });
}

/**
 * Hook untuk perform check-in
 */
export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CheckInRequest) => checkInService.checkIn(request),
    onSuccess: (response) => {
      // API response structure: {success: true, data: CheckInResultResponse, ...}
      const checkInData = response.data;
      
      if (response.success && checkInData?.success) {
        toast.success("Check-in Berhasil", {
          description: checkInData.message || "Tiket berhasil di-check-in",
        });
        // Invalidate check-ins list to refresh data
        queryClient.invalidateQueries({ queryKey: ["check-ins"] });
      } else {
        // This should not happen if API returns success, but handle it anyway
        const errorMessage = checkInData?.message || "Check-in gagal";
        toast.error("Check-in Gagal", {
          description: errorMessage,
        });
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      const message =
        err.response?.data?.error?.message || "Terjadi kesalahan saat check-in";
      toast.error("Check-in Gagal", {
        description: message,
      });
    },
  });
}

/**
 * Hook untuk mendapatkan list check-ins
 */
export function useCheckIns(filters?: CheckInFilters) {
  return useQuery({
    queryKey: ["check-ins", filters],
    queryFn: () => checkInService.getCheckIns(filters),
    staleTime: 10000, // 10 seconds
  });
}

/**
 * Hook untuk mendapatkan check-in by ID
 */
export function useCheckInById(id: string) {
  return useQuery({
    queryKey: ["check-in", id],
    queryFn: () => checkInService.getCheckInById(id),
    enabled: !!id,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook untuk mendapatkan check-ins by QR code
 */
export function useCheckInsByQRCode(qrCode: string) {
  return useQuery({
    queryKey: ["check-ins", "qr", qrCode],
    queryFn: () => checkInService.getCheckInsByQRCode(qrCode),
    enabled: !!qrCode,
    staleTime: 10000, // 10 seconds
  });
}

/**
 * Hook untuk mendapatkan check-ins by order item ID
 */
export function useCheckInsByOrderItemId(orderItemId: string) {
  return useQuery({
    queryKey: ["check-ins", "order-item", orderItemId],
    queryFn: () => checkInService.getCheckInsByOrderItemId(orderItemId),
    enabled: !!orderItemId,
    staleTime: 10000, // 10 seconds
  });
}

/**
 * Hook untuk mendapatkan check-ins by gate ID
 */
export function useCheckInsByGateId(gateId: string) {
  return useQuery({
    queryKey: ["check-ins", "gate", gateId],
    queryFn: () => checkInService.getCheckInsByGateId(gateId),
    enabled: !!gateId,
    staleTime: 10000, // 10 seconds
  });
}

