"use client";

import { MerchandiseInventory } from "@/features/merchandise/components/MerchandiseInventory";
import { MerchandiseProduct } from "@/features/merchandise/types";

// Mock data - will be replaced with actual API data
const mockProducts: readonly MerchandiseProduct[] = [
  {
    id: "merch-1",
    name: "Event Hoodie",
    variant: "Black / Cotton",
    price: 55,
    priceFormatted: "$55",
    stock: 142,
    stockStatus: "healthy",
    stockPercentage: 75,
    iconName: "Shirt",
  },
  {
    id: "merch-2",
    name: "Tote Bag",
    variant: "Canvas",
    price: 25,
    priceFormatted: "$25",
    stock: 310,
    stockStatus: "healthy",
    stockPercentage: 88,
    iconName: "ShoppingBag",
  },
  {
    id: "merch-3",
    name: "Tumbler",
    variant: "Matte Black",
    price: 30,
    priceFormatted: "$30",
    stock: 12,
    stockStatus: "low",
    stockPercentage: 15,
    iconName: "Coffee",
  },
] as const;

export default function MerchandisePage() {
  const handleAddProduct = () => {
    // TODO: Implement add product functionality
    console.log("Add product clicked");
  };

  const handleExportCSV = () => {
    // TODO: Implement CSV export functionality
    console.log("Export CSV clicked");
  };

  const handleProductClick = (productId: string) => {
    // TODO: Navigate to product detail or open edit dialog
    console.log("Product clicked:", productId);
  };

  return (
    <div className="p-6">
      <MerchandiseInventory
        products={mockProducts}
        onAddProduct={handleAddProduct}
        onExportCSV={handleExportCSV}
        onProductClick={handleProductClick}
      />
    </div>
  );
}
