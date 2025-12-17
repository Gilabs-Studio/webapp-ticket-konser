"use client";

import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { merchandiseService } from "@/features/merchandise/services/merchandiseService";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const MerchandiseProductCard = dynamic(
  () =>
    import("@/features/merchandise/components/MerchandiseProductCard").then(
      (mod) => ({ default: mod.MerchandiseProductCard }),
    ),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
  },
);

export function PublicMerchandisePageClient() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["merchandise", "public"],
    queryFn: () => merchandiseService.getMerchandise({ page: 1, per_page: 100, status: "active" }),
    staleTime: 0,
    refetchOnMount: true,
  });

  const products = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Unable to load merchandise. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No merchandise available at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Merchandise</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse our collection of festival merchandise
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <MerchandiseProductCard
            key={product.id}
            product={product}
            onView={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        ))}
      </div>
    </div>
  );
}

