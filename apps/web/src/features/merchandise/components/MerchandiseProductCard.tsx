"use client";

import { SafeImage } from "@/components/ui/image";
import { DynamicIcon } from "@/lib/icon-utils";
import { MerchandiseProduct } from "../types";
import { Edit, Trash2 } from "lucide-react";
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



export function MerchandiseProductCard({
  product,
  onEdit,
  onDelete,
  onView,
  onClick,
}: MerchandiseProductCardProps) {
  const stockColorClass = getStockColorClass(product.stockStatus);


  return (
    <div 
      className="group relative h-[400px] w-full overflow-hidden rounded-3xl bg-muted transition-all hover:shadow-2xl cursor-pointer"
      onClick={() => onClick?.(product.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.(product.id);
        }
      }}
    >
      {/* Full Bleed Image Background */}
      <div className="absolute inset-0 z-0">
        {product.imageUrl ? (
          <SafeImage
            key={product.imageUrl}
            src={product.imageUrl}
            alt={product.name ?? "Product image"}
            fill
            className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            fallbackIcon={true}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-neutral-700">
             <DynamicIcon
              name={product.iconName ?? "Package"}
              className="h-16 w-16 opacity-20"
              size={64}
            />
          </div>
        )}
        {/* Modern Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />
      </div>

      {/* Actions (Top Right) */}
      {(onEdit || onDelete) && (
        <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 transform -translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            {onEdit && (
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full bg-amber-500/80 hover:bg-amber-500/90 text-white border-0 backdrop-blur-md"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(product.id);
                }}
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8 rounded-full bg-red-500/80 hover:bg-red-500/90 text-white border-0 backdrop-blur-md"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(product.id);
                }}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
        </div>
      )}

      {/* Content Overlay (Bottom) */}
      <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white text-left">
        <div className="transform transition-transform duration-300 group-hover:-translate-y-1">
          <div className="flex items-end gap-4 justify-between">
             {/* Left: Title and Price */}
             <div className="flex flex-col gap-1 flex-1 min-w-0">
                <h3 className="text-2xl font-bold leading-tight tracking-tight text-white drop-shadow-sm truncate pr-2">
                  {product.name}
                </h3>
                <span className="text-lg font-semibold text-white drop-shadow-md">
                   {product.priceFormatted || formatCurrency(product.price)}
                </span>
             </div>

             {/* Right: Circular Progress */}
             <div className="flex-none">
                <div className="relative h-12 w-12 flex items-center justify-center">
                  <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                    {/* Background Circle */}
                    <path
                      className="text-white/20"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Progress Circle */}
                    <path
                      className={stockColorClass}
                      strokeDasharray={`${Math.max(0, Math.min(100, product.stockPercentage))}, 100`}
                      strokeWidth="3"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold">{Math.round(product.stockPercentage)}%</span>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
