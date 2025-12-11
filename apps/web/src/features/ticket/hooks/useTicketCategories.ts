"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketService } from "../services/ticketService";
import type { CreateTicketCategoryRequest, UpdateTicketCategoryRequest } from "../types";

export function useTicketCategories() {
  return useQuery({
    queryKey: ["admin", "ticket-categories"],
    queryFn: async () => {
      const response = await ticketService.getTicketCategories();
      if (!response.success || !response.data) {
        throw new Error(response.error?.message ?? "Failed to fetch ticket categories");
      }
      return response.data;
    },
  });
}

export function useTicketCategory(id: string) {
  return useQuery({
    queryKey: ["admin", "ticket-categories", id],
    queryFn: async () => {
      const response = await ticketService.getTicketCategoryById(id);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message ?? "Failed to fetch ticket category");
      }
      return response.data;
    },
    enabled: !!id,
  });
}

export function useTicketCategoriesByEventId(eventId: string) {
  return useQuery({
    queryKey: ["admin", "ticket-categories", "event", eventId],
    queryFn: async () => {
      const response = await ticketService.getTicketCategoriesByEventId(eventId);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message ?? "Failed to fetch ticket categories");
      }
      return response.data;
    },
    enabled: !!eventId,
  });
}

export function useCreateTicketCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketCategoryRequest) => ticketService.createTicketCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ticket-categories"] });
    },
  });
}

export function useUpdateTicketCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketCategoryRequest }) =>
      ticketService.updateTicketCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ticket-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "ticket-categories", variables.id] });
    },
  });
}

export function useDeleteTicketCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketService.deleteTicketCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ticket-categories"] });
    },
  });
}


