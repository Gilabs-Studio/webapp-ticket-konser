"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MerchandiseForm } from "./MerchandiseForm";
import type { MerchandiseProduct } from "../types";

interface MerchandiseEditDialogContentProps {
  readonly isLoading: boolean;
  readonly hasError: boolean;
  readonly product: MerchandiseProduct | undefined;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

export function MerchandiseEditDialogContent({
  isLoading,
  hasError,
  product,
  onClose,
  onSuccess,
}: MerchandiseEditDialogContentProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground mb-4">
          Merchandise not found or has been deleted.
        </p>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <MerchandiseForm
      inDialog
      merchandiseId={product.id}
      defaultValues={{
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        variant: product.variant,
        image_url: product.imageUrl,
        icon_name: product.iconName,
      }}
      onCancel={onClose}
      onSuccess={onSuccess}
    />
  );
}
