"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eventService } from "../services/eventService";
import type {
  CreateEventFormData,
  UpdateEventFormData,
  UpdateEventStatusFormData,
} from "../schemas/event.schema";
import type { Event, EventStatus } from "../types";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function useEvents(filters?: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: EventStatus;
}) {
  return useQuery({
    queryKey: ["events", "admin", filters],
    queryFn: () => eventService.getEvents(filters),
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ["events", "admin", id],
    queryFn: () => eventService.getEventById(id),
    enabled: !!id && id !== "",
    staleTime: 0,
    retry: (failureCount, error) => {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          return false;
        }
      }
      return failureCount < 1;
    },
  });
}

export function usePublicEvents(filters?: {
  page?: number;
  per_page?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ["events", "public", filters],
    queryFn: () => eventService.getPublicEvents(filters),
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function usePublicEvent(id: string) {
  return useQuery({
    queryKey: ["events", "public", id],
    queryFn: () => eventService.getPublicEventById(id),
    enabled: !!id && id !== "",
    staleTime: 0,
    retry: (failureCount, error) => {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          return false;
        }
      }
      return failureCount < 1;
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const t = useTranslations("events");

  return useMutation({
    mutationFn: async ({
      data,
      imageFile,
    }: {
      data: CreateEventFormData;
      imageFile?: File;
    }) => {
      const response = await eventService.createEvent({
        eventName: data.eventName,
        description: data.description,
        bannerImage: data.bannerImage || undefined,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate,
      });

      if (imageFile) {
        await eventService.uploadBanner(response.data.id, imageFile);
      }

      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      await queryClient.refetchQueries({
        queryKey: ["events"],
        type: "active",
        exact: false,
      });
      toast.success(t("createSuccess"));
    },
    onError: (error: unknown) => {
      let errorMessage = t("createError");
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: {
              error?: {
                message?: string;
                field_errors?: Array<{ field: string; message: string }>;
              };
            };
          };
        };
        if (axiosError.response?.data?.error) {
          const apiError = axiosError.response.data.error;
          if (apiError.field_errors && apiError.field_errors.length > 0) {
            errorMessage = apiError.field_errors
              .map((e) => `${e.field}: ${e.message}`)
              .join(", ");
          } else if (apiError.message) {
            errorMessage = apiError.message;
          }
        }
      }
      toast.error(errorMessage);
      console.error("Create event error:", error);
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  const t = useTranslations("events");

  return useMutation({
    mutationFn: async ({
      id,
      data,
      imageFile,
    }: {
      id: string;
      data: UpdateEventFormData;
      imageFile?: File;
    }) => {
      const response = await eventService.updateEvent(id, {
        eventName: data.eventName,
        description: data.description,
        bannerImage: data.bannerImage || undefined,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate,
      });

      if (imageFile) {
        const uploadResponse = await eventService.uploadBanner(id, imageFile);
        return uploadResponse;
      }

      return response;
    },
    onSuccess: async (response, variables) => {
      if (response?.data) {
        queryClient.setQueryData(
          ["events", "admin", variables.id],
          { data: response.data, success: true },
        );

        queryClient.setQueriesData(
          {
            queryKey: ["events"],
            exact: false,
            predicate: (query) => {
              const queryKey = query.queryKey;
              if (
                queryKey.length === 3 &&
                typeof queryKey[2] === "string" &&
                queryKey[2] === variables.id
              ) {
                return false;
              }
              const data = query.state.data as { data?: Event[] };
              return data?.data && Array.isArray(data.data);
            },
          },
          (oldData: { data?: Event[] }) => {
            if (!oldData?.data || !Array.isArray(oldData.data))
              return oldData;

            const updatedEvents = oldData.data.map((event: Event) =>
              event.id === variables.id ? response.data : event,
            );

            return {
              ...oldData,
              data: updatedEvents,
            };
          },
        );
      }

      await queryClient.invalidateQueries({ queryKey: ["events"] });
      await queryClient.invalidateQueries({
        queryKey: ["events", variables.id],
      });

      toast.success(t("updateSuccess"));
    },
    onError: (error: unknown) => {
      let errorMessage = t("updateError");
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: {
              error?: {
                message?: string;
                field_errors?: Array<{ field: string; message: string }>;
              };
            };
          };
        };
        if (axiosError.response?.data?.error) {
          const apiError = axiosError.response.data.error;
          if (apiError.field_errors && apiError.field_errors.length > 0) {
            errorMessage = apiError.field_errors
              .map((e) => `${e.field}: ${e.message}`)
              .join(", ");
          } else if (apiError.message) {
            errorMessage = apiError.message;
          }
        }
      }
      toast.error(errorMessage);
      console.error("Update event error:", error);
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const t = useTranslations("events");

  return useMutation({
    mutationFn: (id: string) => eventService.deleteEvent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      await queryClient.refetchQueries({
        queryKey: ["events"],
        type: "active",
        exact: false,
      });
      toast.success(t("deleteSuccess"));
    },
    onError: (error: unknown) => {
      let errorMessage = t("deleteError");
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: {
              error?: {
                message?: string;
                field_errors?: Array<{ field: string; message: string }>;
              };
            };
          };
        };
        if (axiosError.response?.data?.error) {
          const apiError = axiosError.response.data.error;
          if (apiError.field_errors && apiError.field_errors.length > 0) {
            errorMessage = apiError.field_errors
              .map((e) => `${e.field}: ${e.message}`)
              .join(", ");
          } else if (apiError.message) {
            errorMessage = apiError.message;
          }
        }
      }
      toast.error(errorMessage);
      console.error("Delete event error:", error);
    },
  });
}

export function useUpdateEventStatus() {
  const queryClient = useQueryClient();
  const t = useTranslations("events");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventStatusFormData }) =>
      eventService.updateEventStatus(id, data.status),
    onSuccess: async (response, variables) => {
      if (response?.data) {
        queryClient.setQueryData(
          ["events", "admin", variables.id],
          { data: response.data, success: true },
        );

        queryClient.setQueriesData(
          {
            queryKey: ["events"],
            exact: false,
            predicate: (query) => {
              const data = query.state.data as { data?: Event[] };
              return data?.data && Array.isArray(data.data);
            },
          },
          (oldData: { data?: Event[] }) => {
            if (!oldData?.data || !Array.isArray(oldData.data))
              return oldData;

            const updatedEvents = oldData.data.map((event: Event) =>
              event.id === variables.id ? response.data : event,
            );

            return {
              ...oldData,
              data: updatedEvents,
            };
          },
        );
      }

      await queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success(t("updateStatusSuccess"));
    },
    onError: (error: unknown) => {
      let errorMessage = t("updateStatusError");
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: {
              error?: {
                message?: string;
                field_errors?: Array<{ field: string; message: string }>;
              };
            };
          };
        };
        if (axiosError.response?.data?.error) {
          const apiError = axiosError.response.data.error;
          if (apiError.field_errors && apiError.field_errors.length > 0) {
            errorMessage = apiError.field_errors
              .map((e) => `${e.field}: ${e.message}`)
              .join(", ");
          } else if (apiError.message) {
            errorMessage = apiError.message;
          }
        }
      }
      toast.error(errorMessage);
      console.error("Update event status error:", error);
    },
  });
}

export function useUploadBanner() {
  const queryClient = useQueryClient();
  const t = useTranslations("events");

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      eventService.uploadBanner(id, file),
    onSuccess: async (response, variables) => {
      if (response?.data) {
        queryClient.setQueryData(
          ["events", "admin", variables.id],
          { data: response.data, success: true },
        );

        await queryClient.invalidateQueries({ queryKey: ["events"] });
      }

      toast.success(t("uploadBannerSuccess"));
    },
    onError: (error: unknown) => {
      let errorMessage = t("uploadBannerError");
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: {
              error?: {
                message?: string;
                field_errors?: Array<{ field: string; message: string }>;
              };
            };
          };
        };
        if (axiosError.response?.data?.error) {
          const apiError = axiosError.response.data.error;
          if (apiError.field_errors && apiError.field_errors.length > 0) {
            errorMessage = apiError.field_errors
              .map((e) => `${e.field}: ${e.message}`)
              .join(", ");
          } else if (apiError.message) {
            errorMessage = apiError.message;
          }
        }
      }
      toast.error(errorMessage);
      console.error("Upload banner error:", error);
    },
  });
}

