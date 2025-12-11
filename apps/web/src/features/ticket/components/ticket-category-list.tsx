"use client";

import { useTicketCategories } from "../hooks/useTicketCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TicketCategoryListProps {
  readonly onEdit?: (id: string) => void;
  readonly onDelete?: (id: string) => void;
}

export function TicketCategoryList({ onEdit, onDelete }: TicketCategoryListProps) {
  const { data, isLoading, isError, error } = useTicketCategories();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load ticket categories"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const categories = data ?? [];

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">No ticket categories available</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <Card key={category.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{category.category_name}</CardTitle>
              <div className="flex gap-2">
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(category.id)}>
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button variant="destructive" size="sm" onClick={() => onDelete(category.id)}>
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Price</p>
                <p className="font-semibold">{formatCurrency(category.price)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Quota</p>
                <p className="font-semibold">{category.quota}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Limit per User</p>
                <p className="font-semibold">{category.limit_per_user}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Available</p>
                <p className="font-semibold">{category.quota}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


