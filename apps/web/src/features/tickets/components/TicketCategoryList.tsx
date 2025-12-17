"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
          <Card key={i} className="p-4">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  const categoryList = categories ?? [];

  if (categoryList.length === 0) {
    return (
      <div className="border border-border bg-card/20 rounded-xl p-8 text-center">
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
          <Card key={category.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">
                  {category.category_name}
                </h4>
              </div>
              <div className="flex gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(category)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(category.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">
                  {formatCurrency(category.price)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5" />
                <span>
                  Quota: {category.quota} tickets
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">
                  Limit per user: {category.limit_per_user}
                </span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

