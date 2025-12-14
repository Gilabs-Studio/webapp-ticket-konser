import { useMutation } from "@tanstack/react-query";
import { gateService } from "../services/gateService";
import type { GateCheckInRequest } from "../types";
import { toast } from "sonner";

export function useGateCheckIn(gateId: string) {
  return useMutation({
    mutationFn: (request: GateCheckInRequest) =>
      gateService.gateCheckIn(gateId, request),
    onSuccess: (response) => {
      if (response.data.success) {
        toast.success(response.data.message || "Check-in successful");
      } else {
        toast.error(response.data.message || "Check-in failed");
      }
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to perform check-in";
      toast.error(message);
    },
  });
}

export function useAssignTicketToGate() {
  return useMutation({
    mutationFn: ({
      gateId,
      orderItemId,
    }: {
      gateId: string;
      orderItemId: string;
    }) =>
      gateService.assignTicketToGate(gateId, {
        gate_id: gateId,
        order_item_id: orderItemId,
      }),
    onSuccess: () => {
      toast.success("Ticket assigned to gate successfully");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to assign ticket to gate";
      toast.error(message);
    },
  });
}
