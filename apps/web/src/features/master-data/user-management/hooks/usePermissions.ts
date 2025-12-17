"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { permissionService } from "../services/permissionService";
import type {
  CreatePermissionFormData,
  UpdatePermissionFormData,
  ListPermissionsParams,
} from "../types";
import type { AxiosError } from "axios";

/**
 * Hook untuk fetch list permissions dengan pagination dan filters
 */
export function usePermissions(params?: ListPermissionsParams) {
  return useQuery({
    queryKey: ["permissions", params],
    queryFn: () => permissionService.list(params),
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
 * Hook untuk fetch single permission by ID
 */
export function usePermission(id: string) {
  return useQuery({
    queryKey: ["permissions", id],
    queryFn: () => permissionService.getById(id),
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
 * Hook untuk create permission
 */
export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePermissionFormData) =>
      permissionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
}

/**
 * Hook untuk update permission
 */
export function useUpdatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePermissionFormData;
    }) => permissionService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      queryClient.invalidateQueries({
        queryKey: ["permissions", variables.id],
      });
    },
  });
}

/**
 * Hook untuk delete permission
 */
export function useDeletePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => permissionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
}


