"use client";

import { SafeImage } from "@/components/ui/image";
import { DynamicIcon } from "@/lib/icon-utils";
import { MerchandiseProduct } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type StockStatus = "healthy" | "low" | "out";

interface MerchandiseProductCardProps {
  readonly product: MerchandiseProduct;
  readonly onEdit?: (productId: string) => void;
  readonly onDelete?: (productId: string) => void;
  readonly onView?: (productId: string) => void;
  readonly onClick?: (productId: string) => void;
}

function getStockColorClass(stockStatus: StockStatus): string {
  if (stockStatus === "healthy") return "text-emerald-500";
  if (stockStatus === "low") return "text-orange-500";
  return "text-red-500";
}

function getStockBarColorClass(stockStatus: StockStatus): string {
  if (stockStatus === "healthy") return "bg-emerald-500";
  if (stockStatus === "low") return "bg-orange-500";
  return "bg-red-500";
}

function getStockStatusText(stockStatus: StockStatus): string {
  if (stockStatus === "healthy") return "Healthy";
  if (stockStatus === "low") return "Low";
  return "Out";
}

export function MerchandiseProductCard({
  product,
  onEdit,
  onDelete,
  onView,
  onClick,
}: MerchandiseProductCardProps) {
  const stockColorClass = getStockColorClass(product.stockStatus);
  const stockBarColorClass = getStockBarColorClass(product.stockStatus);
  const stockStatusText = getStockStatusText(product.stockStatus);

  return (
    <div className="border border-border bg-card/30 rounded-md p-4 group hover:border-ring transition-all relative">
      {/* Actions Dropdown */}
      {(onEdit || onDelete || onView) && (
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(product.id);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(product.id);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(product.id);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <button
        type="button"
        className="w-full text-left cursor-pointer"
        onClick={() => onClick?.(product.id)}
      >
        <div className="aspect-square bg-muted rounded-md border border-border mb-4 flex items-center justify-center relative overflow-hidden">
          <SafeImage
            key={product.imageUrl} // Force re-render when imageUrl changes
            src={product.imageUrl}
            alt={product.name ?? "Product image"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            fallback={
              <DynamicIcon
                name={product.iconName ?? "Package"}
                className="text-muted-foreground"
                size={48}
              />
            }
            fallbackIcon={false}
          />
        </div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-sm font-medium text-foreground">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {product.variant ?? product.description ?? ""}
            </p>
          </div>
          <span className="text-sm font-medium text-foreground">
            {product.priceFormatted || formatCurrency(product.price)}
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] uppercase text-muted-foreground font-medium">
            <span>Stock</span>
            <span className={stockColorClass}>{stockStatusText}</span>
          </div>
          <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
            <div
              className={`${stockBarColorClass} h-full rounded-full transition-all`}
              style={{
                width: `${Math.max(0, Math.min(100, product.stockPercentage))}%`,
              }}
            />
          </div>
          <div className="text-[10px] text-muted-foreground text-right pt-1">
            {product.stock} left
          </div>
        </div>
      </button>
    </div>
  );
}
