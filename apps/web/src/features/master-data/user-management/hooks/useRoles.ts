"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roleService } from "../services/roleService";
import type {
  CreateRoleFormData,
  UpdateRoleFormData,
  ListRolesParams,
  AssignPermissionsFormData,
} from "../types";
import type { AxiosError } from "axios";

/**
 * Hook untuk fetch list roles dengan pagination dan filters
 */
export function useRoles(params?: ListRolesParams) {
  return useQuery({
    queryKey: ["roles", params],
    queryFn: () => roleService.list(params),
    retry: (failureCount, error) => {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as AxiosError<{ response?: { status?: number } }>;
        if (axiosError.response?.status === 404) {
          return false;
        }
      }
      return failureCount < 1;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook untuk fetch single role by ID
 */
export function useRole(id: string, includePermissions = false) {
  return useQuery({
    queryKey: ["roles", id, includePermissions],
    queryFn: () =>
      includePermissions
        ? roleService.getByIdWithPermissions(id)
        : roleService.getById(id),
    enabled: !!id,
    retry: (failureCount, error) => {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as AxiosError<{ response?: { status?: number } }>;
        if (axiosError.response?.status === 404) {
          return false;
        }
      }
      return failureCount < 1;
    },
  });
}

/**
 * Hook untuk create role
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleFormData) => roleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

/**
 * Hook untuk update role
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleFormData }) =>
      roleService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["roles", variables.id] });
    },
  });
}

/**
 * Hook untuk delete role
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => roleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

/**
 * Hook untuk assign permissions to role
 */
export function useAssignPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: AssignPermissionsFormData;
    }) => roleService.assignPermissions(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({
        queryKey: ["roles", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["roles", variables.id, true],
      });
    },
  });
}

