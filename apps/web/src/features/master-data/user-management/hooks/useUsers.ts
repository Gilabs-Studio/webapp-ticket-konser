"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/userService";
import type {
  CreateUserFormData,
  UpdateUserFormData,
  ListUsersParams,
} from "../types";
import type { AxiosError } from "axios";

/**
 * Hook untuk fetch list users dengan pagination dan filters
 */
export function useUsers(params?: ListUsersParams) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => userService.list(params),
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
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
 * Hook untuk fetch single user by ID
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => userService.getById(id),
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
 * Hook untuk create user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserFormData) => userService.create(data),
    onSuccess: () => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

/**
 * Hook untuk update user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserFormData }) =>
      userService.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate users list and specific user
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
    },
  });
}

/**
 * Hook untuk delete user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}




