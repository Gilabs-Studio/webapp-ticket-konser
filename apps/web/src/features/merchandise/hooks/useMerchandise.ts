"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { merchandiseService } from "../services/merchandiseService";
import type {
  MerchandiseFormData,
  UpdateMerchandiseFormData,
} from "../schemas/merchandise.schema";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";

export function useMerchandise(filters?: {
  page?: number;
  per_page?: number;
  event_id?: string;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["merchandise", filters],
    queryFn: () => merchandiseService.getMerchandise(filters),
    staleTime: 0, // Always refetch when invalidated
    refetchOnMount: true,
  });
}

export function useMerchandiseById(id: string) {
  return useQuery({
    queryKey: ["merchandise", id],
    queryFn: () => merchandiseService.getMerchandiseById(id),
    enabled: !!id && id !== "",
    staleTime: 0, // Always refetch when invalidated
    retry: (failureCount, error) => {
      // Don't retry on 404 (not found) errors
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

export function useCreateMerchandise() {
  const queryClient = useQueryClient();
  const t = useTranslations("merchandise");

  return useMutation({
    mutationFn: async ({
      data,
      imageFile,
    }: {
      data: MerchandiseFormData;
      imageFile?: File;
    }) => {
      // For now, we'll send the data without image upload
      // Backend upload will be implemented later
      // TODO: Implement image upload to backend when ready
      const response = await merchandiseService.createMerchandise({
        event_id: data.event_id,
        name: data.name,
        description: data.description,
        price: data.price,
        priceFormatted: formatCurrency(data.price),
        stock: data.stock,
        variant: data.variant,
        iconName: data.icon_name ?? "Package",
      });

      // If image file exists, we'll need to upload it separately
      // For now, just log it
      if (imageFile) {
        console.log("Image file ready for upload:", imageFile);
        // TODO: Upload image file to backend
        // await merchandiseService.uploadMerchandiseImage(response.data.id, imageFile);
      }

      return response;
    },
    onSuccess: async () => {
      // Invalidate all related queries
      await queryClient.invalidateQueries({ queryKey: ["merchandise"] });
      // Force refetch to ensure UI updates immediately
      await queryClient.refetchQueries({ 
        queryKey: ["merchandise"],
        type: "active",
        exact: false
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
      console.error("Create merchandise error:", error);
    },
  });
}

export function useUpdateMerchandise() {
  const queryClient = useQueryClient();
  const t = useTranslations("merchandise");

  return useMutation({
    mutationFn: async ({
      id,
      data,
      imageFile,
    }: {
      id: string;
      data: UpdateMerchandiseFormData;
      imageFile?: File;
    }) => {
      // For now, we'll send the data without image upload
      // Backend upload will be implemented later
      const response = await merchandiseService.updateMerchandise(id, {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        variant: data.variant,
        iconName: data.icon_name,
      });

      // If image file exists, we'll need to upload it separately
      // For now, just log it
      if (imageFile) {
        console.log("Image file ready for upload:", imageFile);
        // TODO: Upload image file to backend
        // await merchandiseService.uploadMerchandiseImage(id, imageFile);
      }

      return response;
    },
    onSuccess: async () => {
      // Invalidate all related queries
      await queryClient.invalidateQueries({ queryKey: ["merchandise"] });
      await queryClient.invalidateQueries({ queryKey: ["merchandise", "inventory"] });
      // Force refetch to ensure UI updates immediately
      await queryClient.refetchQueries({ 
        queryKey: ["merchandise"],
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
      console.error("Update merchandise error:", error);
    },
  });
}

export function useDeleteMerchandise() {
  const queryClient = useQueryClient();
  const t = useTranslations("merchandise");

  return useMutation({
    mutationFn: (id: string) => merchandiseService.deleteMerchandise(id),
    onSuccess: async () => {
      // Invalidate all related queries
      await queryClient.invalidateQueries({ queryKey: ["merchandise"] });
      await queryClient.invalidateQueries({ queryKey: ["merchandise", "inventory"] });
      // Force refetch to ensure UI updates immediately
      await queryClient.refetchQueries({ 
        queryKey: ["merchandise"],
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
      console.error("Delete merchandise error:", error);
    },
  });
}


