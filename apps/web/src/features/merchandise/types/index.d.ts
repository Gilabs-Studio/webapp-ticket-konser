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
  readonly purchaseHistory?: readonly {
    readonly date: string;
    readonly quantity: number;
    readonly totalAmount: number;
  }[];
  readonly itemHistory?: readonly {
    readonly id: string;
    readonly date: string;
    readonly type: "restock" | "sold" | "adjustment" | "return";
    readonly change_amount: number;
    readonly new_stock: number;
    readonly notes?: string;
    readonly performed_by?: string;
  }[];
}

export interface MerchandiseInventory {
  readonly products: readonly MerchandiseProduct[];
  readonly totalProducts: number;
  readonly totalStock: number;
  readonly lowStockCount: number;
}
