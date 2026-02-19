import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gateService } from "../services/gateService";
import type {
  CreateGateRequest,
  GateFilters,
  UpdateGateRequest,
} from "../types";
import { toast } from "sonner";

export function useGates(filters?: GateFilters) {
  return useQuery({
    queryKey: ["gates", filters],
    queryFn: () => gateService.getGates(filters),
    staleTime: 30000, // 30 seconds
  });
}

export function useMyGates() {
  return useQuery({
    queryKey: ["gates", "my"],
    queryFn: () => gateService.getMyGates(),
    staleTime: 30000, // 30 seconds
    enabled: true,
  });
}

export function useMyGatesEnabled(enabled: boolean) {
  return useQuery({
    queryKey: ["gates", "my"],
    queryFn: () => gateService.getMyGates(),
    staleTime: 30000, // 30 seconds
    enabled,
  });
}

export function useGate(id: string) {
  return useQuery({
    queryKey: ["gate", id],
    queryFn: () => gateService.getGateById(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useCreateGate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateGateRequest) =>
      gateService.createGate(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gates"] });
      toast.success("Gate created successfully");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to create gate";
      toast.error(message);
    },
  });
}

export function useUpdateGate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: UpdateGateRequest;
    }) => gateService.updateGate(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gates"] });
      queryClient.invalidateQueries({ queryKey: ["gate", variables.id] });
      toast.success("Gate updated successfully");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to update gate";
      toast.error(message);
    },
  });
}

export function useDeleteGate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => gateService.deleteGate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gates"] });
      toast.success("Gate deleted successfully");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to delete gate";
      toast.error(message);
    },
  });
}

export function useGateStatistics(gateId: string) {
  return useQuery({
    queryKey: ["gate-statistics", gateId],
    queryFn: () => gateService.getGateStatistics(gateId),
    enabled: !!gateId,
    staleTime: 10000, // 10 seconds - statistics should be more frequently updated
  });
}

export function useAssignedStaff(gateId: string) {
  return useQuery({
    queryKey: ["gate-staff", gateId],
    queryFn: () => gateService.getAssignedStaff(gateId),
    enabled: !!gateId,
  });
}

export function useAssignStaffToGate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      gateId,
      staffId,
    }: {
      gateId: string;
      staffId: string;
    }) => gateService.assignStaffToGate(gateId, { staff_id: staffId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gate-staff", variables.gateId] });
      toast.success("Staff assigned successfully");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to assign staff";
      toast.error(message);
    },
  });
}

export function useUnassignStaffFromGate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      gateId,
      staffId,
    }: {
      gateId: string;
      staffId: string;
    }) => gateService.unassignStaffFromGate(gateId, staffId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gate-staff", variables.gateId] });
      toast.success("Staff unassigned successfully");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to unassign staff";
      toast.error(message);
    },
  });
}
