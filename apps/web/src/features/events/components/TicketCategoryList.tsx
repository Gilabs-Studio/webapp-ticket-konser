"use client";


import { Button } from "@/components/ui/button";

import { Edit, Trash2, DollarSign, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface TicketCategory {
  readonly id: string;
  readonly event_id: string;
  readonly category_name: string;
  readonly price: number;
  readonly quota: number;
  readonly limit_per_user: number;
  readonly created_at?: string;
  readonly updated_at?: string;
}

interface TicketCategoryListProps {
  readonly categories?: TicketCategory[];
  readonly isLoading?: boolean;
  readonly onEdit?: (category: TicketCategory) => void;
  readonly onDelete?: (id: string) => void;
}

export function TicketCategoryList({
  categories,
  isLoading,
  onEdit,
  onDelete,
}: TicketCategoryListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-3xl border border-border/50 bg-card/40 p-6 h-[200px]">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-6" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  const categoryList = categories ?? [];

  if (categoryList.length === 0) {
    return (
      <div className="border border-border bg-card/20 rounded-md p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No ticket categories available
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categoryList.map((category) => {
        // Calculate sold (quota - remaining, but we don't have remaining in category)
        // For now, we'll just show quota
        const sold = 0; // This should come from API if available

        return (
          <div 
            key={category.id} 
            className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/40 p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:bg-card/60"
          >
             {/* Decorative Gradient on Hover */}
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                    {category.category_name}
                  </h4>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(category)}
                      className="h-8 w-8 rounded-full hover:bg-background/80 hover:text-foreground backdrop-blur-sm"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(category.id)}
                      className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 backdrop-blur-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                     <DollarSign className="h-4 w-4" /> Price
                  </span>
                  <span className="font-bold text-foreground">
                    {formatCurrency(category.price)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                   <span className="text-muted-foreground flex items-center gap-2">
                     <Users className="h-4 w-4" /> Sold / Quota
                   </span>
                   <div className="flex items-center gap-1.5 font-medium">
                      <span className="text-foreground">0</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-foreground">{category.quota}</span>
                   </div>
                </div>
                 <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Limit per user</span>
                    <span className="font-mono bg-muted/50 px-2 py-0.5 rounded-full">{category.limit_per_user}</span>
                 </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

