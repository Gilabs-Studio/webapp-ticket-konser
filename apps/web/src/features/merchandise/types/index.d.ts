export interface MerchandiseProduct {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly price: number;
  readonly priceFormatted: string;
  readonly stock: number;
  readonly stockStatus: "healthy" | "low" | "out";
  readonly stockPercentage: number;
  readonly variant?: string;
  readonly iconName: string;
  readonly imageUrl?: string;
  readonly isActive: boolean;
  readonly purchaseHistory?: {
    readonly date: string;
    readonly quantity: number;
    readonly totalAmount: number;
  }[];
  readonly itemHistory?: {
    readonly id: string;
    readonly date: string;
    readonly type: "restock" | "sold" | "adjustment" | "return";
    readonly quantity: number;
    readonly notes?: string;
    readonly performedBy?: string;
  }[];
}

export interface MerchandiseInventory {
  readonly products: readonly MerchandiseProduct[];
  readonly totalProducts: number;
  readonly totalStock: number;
  readonly lowStockCount: number;
}
