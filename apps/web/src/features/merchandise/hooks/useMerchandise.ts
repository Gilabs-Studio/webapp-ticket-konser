"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { merchandiseService } from "../services/merchandiseService";
import type {
  MerchandiseFormData,
  UpdateMerchandiseFormData,
} from "../schemas/merchandise.schema";
import type { MerchandiseProduct } from "../types";
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

export function usePublicMerchandise(filters?: { page?: number; per_page?: number }) {
  return useQuery({
    queryKey: ["merchandise", "public", filters],
    queryFn: () => merchandiseService.getPublicMerchandise(filters),
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function usePublicMerchandiseById(id: string) {
  return useQuery({
    queryKey: ["merchandise", "public", id],
    queryFn: () => merchandiseService.getPublicMerchandiseById(id),
    enabled: !!id && id !== "",
    staleTime: 0,
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
      // Create merchandise first
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

      // If image file exists, upload it
      if (imageFile) {
        await merchandiseService.uploadMerchandiseImage(
          response.data.id,
          imageFile,
        );
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
      // Update merchandise first
      const response = await merchandiseService.updateMerchandise(id, {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        variant: data.variant,
        iconName: data.icon_name,
        isActive: data.status === "active",
      });

      // If image file exists, upload it and return the upload response (which has the new image URL)
      if (imageFile) {
        const uploadResponse = await merchandiseService.uploadMerchandiseImage(id, imageFile);
        return uploadResponse; // Return upload response which contains updated image URL
      }

      return response;
    },
    onSuccess: async (response, variables) => {
      // Update cache immediately with new data (optimistic update)
      if (response?.data) {
        // Update merchandise by ID cache
        queryClient.setQueryData(
          ["merchandise", variables.id],
          { data: response.data, success: true }
        );

        // Update merchandise list cache if it exists
        // Only update queries that have array data (list queries), skip single product queries
        queryClient.setQueriesData(
          { 
            queryKey: ["merchandise"], 
            exact: false,
            predicate: (query) => {
              // Skip query keys that match ["merchandise", id] pattern (single product)
              const queryKey = query.queryKey;
              if (queryKey.length === 2 && typeof queryKey[1] === "string" && queryKey[1] === variables.id) {
                return false;
              }
              // Only process queries with array data
              const data = query.state.data as any;
              return data?.data && Array.isArray(data.data);
            }
          },
          (oldData: any) => {
            // Double check that data is array (safety check)
            if (!oldData?.data || !Array.isArray(oldData.data)) return oldData;
            
            const updatedProducts = oldData.data.map((product: MerchandiseProduct) =>
              product.id === variables.id ? response.data : product
            );
            
            return {
              ...oldData,
              data: updatedProducts,
            };
          }
        );

        // Update inventory cache if it exists
        queryClient.setQueriesData(
          { queryKey: ["merchandise", "inventory"], exact: false },
          (oldData: any) => {
            if (!oldData?.data?.products) return oldData;
            
            const updatedProducts = oldData.data.products.map((product: MerchandiseProduct) =>
              product.id === variables.id ? response.data : product
            );
            
            return {
              ...oldData,
              data: {
                ...oldData.data,
                products: updatedProducts,
              },
            };
          }
        );
      }

      // Invalidate all related queries to ensure consistency
      await queryClient.invalidateQueries({ queryKey: ["merchandise"] });
      await queryClient.invalidateQueries({ queryKey: ["merchandise", "inventory"] });
      // Invalidate specific merchandise by ID to refresh edit dialog
      await queryClient.invalidateQueries({ queryKey: ["merchandise", variables.id] });
      
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


