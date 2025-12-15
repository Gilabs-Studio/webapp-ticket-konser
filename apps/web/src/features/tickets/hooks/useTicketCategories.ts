"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ticketCategoryService } from "../services/ticketCategoryService";
import type {
  TicketCategoryFormData,
  UpdateTicketCategoryFormData,
} from "../schemas/ticket-category.schema";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function useTicketCategory(id: string) {
  return useQuery({
    queryKey: ["ticket-category", id],
    queryFn: () => ticketCategoryService.getTicketCategoryById(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useCreateTicketCategory() {
  const queryClient = useQueryClient();
  const t = useTranslations("tickets");

  return useMutation({
    mutationFn: (data: TicketCategoryFormData) =>
      ticketCategoryService.createTicketCategory(data),
    onSuccess: async () => {
      // Invalidate all related queries
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
      await queryClient.invalidateQueries({ queryKey: ["ticket-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["recent-orders"] });
      // Force refetch to ensure UI updates immediately
      await queryClient.refetchQueries({ 
        queryKey: ["tickets"],
        type: "active" 
      });
      toast.success(t("createSuccess"));
    },
    onError: (error: unknown) => {
      // Extract error message from API response
      let errorMessage = t("createError");
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { error?: { message?: string; field_errors?: Array<{ field: string; message: string }> } } } };
        if (axiosError.response?.data?.error) {
          const apiError = axiosError.response.data.error;
          if (apiError.field_errors && apiError.field_errors.length > 0) {
            errorMessage = apiError.field_errors.map(e => `${e.field}: ${e.message}`).join(", ");
          } else if (apiError.message) {
            errorMessage = apiError.message;
          }
        }
      }
      toast.error(errorMessage);
      console.error("Create ticket category error:", error);
    },
  });
}

export function useUpdateTicketCategory() {
  const queryClient = useQueryClient();
  const t = useTranslations("tickets");

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTicketCategoryFormData;
    }) => ticketCategoryService.updateTicketCategory(id, data),
    onSuccess: async () => {
      // Invalidate all related queries
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
      await queryClient.invalidateQueries({ queryKey: ["ticket-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["ticket-category"] });
      await queryClient.invalidateQueries({ queryKey: ["recent-orders"] });
      // Force refetch all active tickets queries to ensure UI updates immediately
      await queryClient.refetchQueries({ 
        queryKey: ["tickets"],
        type: "active",
        exact: false
      });
      toast.success(t("updateSuccess"));
    },
    onError: (error: unknown) => {
      // Extract error message from API response
      let errorMessage = t("updateError");
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { error?: { message?: string; field_errors?: Array<{ field: string; message: string }> } } } };
        if (axiosError.response?.data?.error) {
          const apiError = axiosError.response.data.error;
          if (apiError.field_errors && apiError.field_errors.length > 0) {
            errorMessage = apiError.field_errors.map(e => `${e.field}: ${e.message}`).join(", ");
          } else if (apiError.message) {
            errorMessage = apiError.message;
          }
        }
      }
      toast.error(errorMessage);
      console.error("Update ticket category error:", error);
    },
  });
}

export function useDeleteTicketCategory() {
  const queryClient = useQueryClient();
  const t = useTranslations("tickets");

  return useMutation({
    mutationFn: (id: string) => ticketCategoryService.deleteTicketCategory(id),
    onSuccess: async () => {
      // Invalidate all related queries
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
      await queryClient.invalidateQueries({ queryKey: ["ticket-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["ticket-category"] });
      await queryClient.invalidateQueries({ queryKey: ["recent-orders"] });
      // Force refetch all active tickets queries to ensure UI updates immediately
      await queryClient.refetchQueries({ 
        queryKey: ["tickets"],
        type: "active",
        exact: false
      });
      toast.success(t("deleteSuccess"));
    },
    onError: (error: unknown) => {
      // Extract error message from API response
      let errorMessage = t("deleteError");
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { error?: { message?: string; field_errors?: Array<{ field: string; message: string }> } } } };
        if (axiosError.response?.data?.error) {
          const apiError = axiosError.response.data.error;
          if (apiError.field_errors && apiError.field_errors.length > 0) {
            errorMessage = apiError.field_errors.map(e => `${e.field}: ${e.message}`).join(", ");
          } else if (apiError.message) {
            errorMessage = apiError.message;
          }
        }
      }
      toast.error(errorMessage);
      console.error("Delete ticket category error:", error);
    },
  });
}
