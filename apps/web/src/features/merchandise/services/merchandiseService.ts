import apiClient from "@/lib/api-client";
import type { MerchandiseProduct, MerchandiseInventory } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Helper function to convert relative image URL to full URL
 */
function getFullImageUrl(imageUrl?: string | null): string | undefined {
  if (!imageUrl) return undefined;
  
  // If already a full URL (http/https), return as is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  
  // If relative path, prepend API base URL
  if (imageUrl.startsWith("/")) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  
  return imageUrl;
}

// API Response types
interface MerchandiseResponse {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  price: number;
  price_formatted: string;
  stock: number;
  stock_status: "healthy" | "low" | "out";
  stock_percentage: number;
  variant?: string;
  image_url?: string;
  icon_name?: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  purchase_history?: {
    date: string;
    quantity: number;
    total_amount: number;
  }[];
  item_history?: {
    id: string;
    date: string; // created_at mapped to date? No, response has created_at
    created_at: string;
    type: "restock" | "sold" | "adjustment" | "return";
    change_amount: number;
    new_stock: number;
    notes: string;
    performed_by: string;
  }[];
}

interface InventoryResponse {
  total_products: number;
  total_stock: number;
  low_stock_count: number;
  out_of_stock_count: number;
  products: MerchandiseResponse[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    pagination?: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
  timestamp: string;
  request_id: string;
}

export const merchandiseService = {
  /**
   * Get list of merchandise
   */
  async getMerchandise(filters?: {
    page?: number;
    per_page?: number;
    event_id?: string;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<MerchandiseProduct[]>> {
    const params = new URLSearchParams();
    if (filters?.page) {
      params.append("page", filters.page.toString());
    }
    if (filters?.per_page) {
      params.append("per_page", filters.per_page.toString());
    }
    if (filters?.event_id) {
      params.append("event_id", filters.event_id);
    }
    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }

    const response = await apiClient.get<ApiResponse<MerchandiseResponse[]>>(
      `/merchandise?${params.toString()}`,
    );

    // Map API response to frontend types
    const products: MerchandiseProduct[] = (response.data.data ?? []).map(
      (m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        price: m.price,
        priceFormatted: m.price_formatted,
        stock: m.stock,
        stockStatus: m.stock_status,
        stockPercentage: m.stock_percentage,
        variant: m.variant,
        iconName: m.icon_name ?? "Package",
        imageUrl: getFullImageUrl(m.image_url),
        isActive: m.status === "active",
        purchaseHistory: m.purchase_history?.map(p => ({
            date: p.date,
            quantity: p.quantity,
            totalAmount: p.total_amount,
        })),
        itemHistory: m.item_history?.map(h => ({
          id: h.id,
          date: h.created_at,
          type: h.type,
          change_amount: h.change_amount,
          new_stock: h.new_stock,
          notes: h.notes,
          performed_by: h.performed_by,
        })),
      }),
    );

    return {
      success: response.data.success,
      data: products,
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Get merchandise by ID
   */
  async getMerchandiseById(id: string): Promise<ApiResponse<MerchandiseProduct>> {
    const response = await apiClient.get<ApiResponse<MerchandiseResponse>>(
      `/merchandise/${id}`,
    );

    const product: MerchandiseProduct = {
      id: response.data.data.id,
      name: response.data.data.name,
      description: response.data.data.description,
      price: response.data.data.price,
      priceFormatted: response.data.data.price_formatted,
      stock: response.data.data.stock,
      stockStatus: response.data.data.stock_status,
      stockPercentage: response.data.data.stock_percentage,
      variant: response.data.data.variant,
      iconName: response.data.data.icon_name ?? "Package",
      imageUrl: getFullImageUrl(response.data.data.image_url),
      isActive: response.data.data.status === "active",
      purchaseHistory: response.data.data.purchase_history?.map(p => ({
        date: p.date,
        quantity: p.quantity,
        totalAmount: p.total_amount,
      })),
      itemHistory: response.data.data.item_history?.map(h => ({
        id: h.id,
        date: h.created_at,
        type: h.type,
        change_amount: h.change_amount,
        new_stock: h.new_stock,
        notes: h.notes,
        performed_by: h.performed_by,
      })),
    };

    return {
      success: response.data.success,
      data: product,
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Create merchandise
   */
  async createMerchandise(
    data: Omit<MerchandiseProduct, "id" | "stockStatus" | "stockPercentage" | "isActive"> & {
      event_id: string;
      isActive?: boolean;
    },
  ): Promise<ApiResponse<MerchandiseProduct>> {
    const response = await apiClient.post<
      ApiResponse<MerchandiseResponse>
    >("/merchandise", {
      event_id: data.event_id,
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      variant: data.variant,
      image_url: "",
      icon_name: data.iconName,
      status: data.isActive ? "active" : "inactive",
    });

    const product: MerchandiseProduct = {
      id: response.data.data.id,
      name: response.data.data.name,
      description: response.data.data.description,
      price: response.data.data.price,
      priceFormatted: response.data.data.price_formatted,
      stock: response.data.data.stock,
      stockStatus: response.data.data.stock_status,
      stockPercentage: response.data.data.stock_percentage,
      variant: response.data.data.variant,
      iconName: response.data.data.icon_name ?? "Package",
      imageUrl: getFullImageUrl(response.data.data.image_url),
      isActive: response.data.data.status === "active",
    };

    return {
      success: response.data.success,
      data: product,
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Update merchandise
   */
  async updateMerchandise(
    id: string,
    data: Partial<MerchandiseProduct>,
  ): Promise<ApiResponse<MerchandiseProduct>> {
    const response = await apiClient.put<ApiResponse<MerchandiseResponse>>(
      `/merchandise/${id}`,
      {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        variant: data.variant,
        icon_name: data.iconName,
        status: data.isActive !== undefined ? (data.isActive ? "active" : "inactive") : undefined,
      },
    );

    const product: MerchandiseProduct = {
      id: response.data.data.id,
      name: response.data.data.name,
      description: response.data.data.description,
      price: response.data.data.price,
      priceFormatted: response.data.data.price_formatted,
      stock: response.data.data.stock,
      stockStatus: response.data.data.stock_status,
      stockPercentage: response.data.data.stock_percentage,
      variant: response.data.data.variant,
      iconName: response.data.data.icon_name ?? "Package",
      imageUrl: getFullImageUrl(response.data.data.image_url),
      isActive: response.data.data.status === "active",
    };

    return {
      success: response.data.success,
      data: product,
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Delete merchandise
   */
  async deleteMerchandise(id: string): Promise<void> {
    await apiClient.delete(`/merchandise/${id}`);
  },

  /**
   * Get merchandise inventory
   */
  async getInventory(eventId?: string): Promise<ApiResponse<MerchandiseInventory>> {
    const params = new URLSearchParams();
    if (eventId) {
      params.append("event_id", eventId);
    }

    const response = await apiClient.get<ApiResponse<InventoryResponse>>(
      `/merchandise/inventory?${params.toString()}`,
    );

    const inventory: MerchandiseInventory = {
      totalProducts: response.data.data.total_products ?? 0,
      totalStock: response.data.data.total_stock ?? 0,
      lowStockCount: response.data.data.low_stock_count ?? 0,
      products: (response.data.data.products ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        priceFormatted: p.price_formatted,
        stock: p.stock,
        stockStatus: p.stock_status,
        stockPercentage: p.stock_percentage,
        variant: p.variant,
        iconName: p.icon_name ?? "Package",
        imageUrl: getFullImageUrl(p.image_url),
        isActive: p.status === "active",
      })),
    };

    return {
      success: response.data.success,
      data: inventory,
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Get public list of active merchandise (no auth required)
   */
  async getPublicMerchandise(filters?: {
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<MerchandiseProduct[]>> {
    const params = new URLSearchParams();
    if (filters?.page) {
      params.append("page", filters.page.toString());
    }
    if (filters?.per_page) {
      params.append("per_page", filters.per_page.toString());
    }

    const response = await apiClient.get<ApiResponse<MerchandiseResponse[]>>(
      `/public/merchandise?${params.toString()}`,
    );

    const products: MerchandiseProduct[] = (response.data.data ?? []).map(
      (m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        price: m.price,
        priceFormatted: m.price_formatted,
        stock: m.stock,
        stockStatus: m.stock_status,
        stockPercentage: m.stock_percentage,
        variant: m.variant,
        iconName: m.icon_name ?? "Package",
        imageUrl: getFullImageUrl(m.image_url),
        isActive: m.status === "active",
      }),
    );

    return {
      success: response.data.success,
      data: products,
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Get public merchandise by ID (no auth required)
   */
  async getPublicMerchandiseById(id: string): Promise<ApiResponse<MerchandiseProduct>> {
    const response = await apiClient.get<ApiResponse<MerchandiseResponse>>(
      `/public/merchandise/${id}`,
    );

    const product: MerchandiseProduct = {
      id: response.data.data.id,
      name: response.data.data.name,
      description: response.data.data.description,
      price: response.data.data.price,
      priceFormatted: response.data.data.price_formatted,
      stock: response.data.data.stock,
      stockStatus: response.data.data.stock_status,
      stockPercentage: response.data.data.stock_percentage,
      variant: response.data.data.variant,
      iconName: response.data.data.icon_name ?? "Package",
      imageUrl: getFullImageUrl(response.data.data.image_url),
      isActive: response.data.data.status === "active",
    };

    return {
      success: response.data.success,
      data: product,
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Upload merchandise image
   */
  async uploadMerchandiseImage(
    id: string,
    imageFile: File,
  ): Promise<ApiResponse<MerchandiseProduct>> {
    const formData = new FormData();
    formData.append("image", imageFile);

    // Don't set Content-Type manually - axios will set it with boundary automatically
    const response = await apiClient.post<ApiResponse<MerchandiseResponse>>(
      `/merchandise/${id}/image`,
      formData,
    );

    const product: MerchandiseProduct = {
      id: response.data.data.id,
      name: response.data.data.name,
      description: response.data.data.description,
      price: response.data.data.price,
      priceFormatted: response.data.data.price_formatted,
      stock: response.data.data.stock,
      stockStatus: response.data.data.stock_status,
      stockPercentage: response.data.data.stock_percentage,
      variant: response.data.data.variant,
      iconName: response.data.data.icon_name ?? "Package",
      imageUrl: getFullImageUrl(response.data.data.image_url),
      isActive: response.data.data.status === "active",
    };

    return {
      success: response.data.success,
      data: product,
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },
};
