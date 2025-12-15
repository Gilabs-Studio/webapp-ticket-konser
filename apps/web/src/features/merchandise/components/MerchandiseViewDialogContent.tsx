"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { MerchandiseProductCard } from "./MerchandiseProductCard";
import type { MerchandiseProduct } from "../types";

interface MerchandiseViewDialogContentProps {
  readonly isLoading: boolean;
  readonly hasError: boolean;
  readonly product: MerchandiseProduct | undefined;
  readonly onClose: () => void;
  readonly onEdit: (productId: string) => void;
  readonly onDelete: (productId: string) => void;
}

export function MerchandiseViewDialogContent({
  isLoading,
  hasError,
  product,
  onClose,
  onEdit,
  onDelete,
}: MerchandiseViewDialogContentProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
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

  const handleEdit = () => {
    onClose();
    onEdit(product.id);
  };

  const handleDelete = () => {
    onClose();
    onDelete(product.id);
  };

  return (
    <div className="space-y-4">
      <MerchandiseProductCard product={product} onClick={() => {}} />
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <Button variant="outline" onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
}
