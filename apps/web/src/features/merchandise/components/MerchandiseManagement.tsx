"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { type MerchandiseProduct } from "../types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MerchandiseForm } from "./MerchandiseForm";
import { MerchandiseProductCard } from "./MerchandiseProductCard";
import { useMerchandiseById, useDeleteMerchandise } from "../hooks/useMerchandise";
import { MerchandiseEditDialogContent } from "./MerchandiseEditDialogContent";
import { MerchandiseViewDialogContent } from "./MerchandiseViewDialogContent";

interface MerchandiseManagementProps {
  readonly products?: readonly MerchandiseProduct[];
  readonly isLoading?: boolean;
  readonly onExportCSV?: () => void;
}

export function MerchandiseManagement({
  products = [],
  isLoading = false,
  onExportCSV,
}: MerchandiseManagementProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Only fetch product if we have a valid ID and dialog is open
  const shouldFetchProduct = !!selectedProductId && (editDialogOpen || viewDialogOpen);
  const { data: productData, isLoading: isLoadingProduct, error: productError } = useMerchandiseById(
    shouldFetchProduct ? selectedProductId : ""
  );
  const { mutate: deleteMerchandise, isPending: isDeleting } = useDeleteMerchandise();

  const handleCreate = () => {
    setCreateDialogOpen(true);
  };

  const handleEdit = (productId: string) => {
    setSelectedProductId(productId);
    setEditDialogOpen(true);
  };

  const handleDelete = (productId: string) => {
    // Close view dialog if open for this product
    if (viewDialogOpen && selectedProductId === productId) {
      setViewDialogOpen(false);
    }
    setSelectedProductId(productId);
    setDeleteDialogOpen(true);
  };

  const handleView = (productId: string) => {
    setSelectedProductId(productId);
    setViewDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setSelectedProductId(null);
  };

  const handleDeleteConfirm = () => {
    if (selectedProductId) {
      deleteMerchandise(selectedProductId, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          // Close view dialog if open
          setViewDialogOpen(false);
          // Clear selected product ID to prevent fetching deleted merchandise
          setSelectedProductId(null);
        },
      });
    }
  };

  const product = productData?.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-foreground tracking-tight">
          Merchandise Inventory
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCSV}
            className="text-xs px-3 py-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleCreate}
            className="text-xs px-3 py-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={`skeleton-${i}`}
              className="border border-border bg-card/30 rounded-xl p-4 animate-pulse"
            >
              <div className="aspect-square bg-muted rounded-xl mb-4" />
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-2 bg-muted rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && products.length === 0 && (
        <div className="border border-border bg-card/30 rounded-xl p-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            No products found. Create one to get started.
          </p>
          <Button variant="outline" size="sm" onClick={handleCreate}>
            <Plus className="h-3.5 w-3.5" />
            Add Product
          </Button>
        </div>
      )}

      {/* Products List */}
      {!isLoading && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <MerchandiseProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              onClick={(productId: string) => handleView(productId)}
            />
          ))}
        </div>
      )}

      {/* Create Merchandise Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Merchandise</DialogTitle>
            <DialogDescription>
              Add a new merchandise product to the inventory. Fill in the required information below.
            </DialogDescription>
          </DialogHeader>
          <MerchandiseForm
            inDialog
            onCancel={() => setCreateDialogOpen(false)}
            onSuccess={handleCreateSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Merchandise Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setSelectedProductId(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Merchandise</DialogTitle>
            <DialogDescription>
              Update merchandise information. Make your changes below.
            </DialogDescription>
          </DialogHeader>
          <MerchandiseEditDialogContent
            isLoading={isLoadingProduct}
            hasError={!!productError}
            product={product}
            onClose={() => {
              setEditDialogOpen(false);
              setSelectedProductId(null);
            }}
            onSuccess={handleEditSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Merchandise</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this merchandise? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedProductId(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Merchandise Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onOpenChange={(open) => {
          setViewDialogOpen(open);
          if (!open) {
            // Clear selected product when dialog closes
            setSelectedProductId(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Merchandise Details</DialogTitle>
            <DialogDescription>
              View merchandise product information.
            </DialogDescription>
          </DialogHeader>
          <MerchandiseViewDialogContent
            isLoading={isLoadingProduct}
            hasError={!!productError}
            product={product}
            onClose={() => {
              setViewDialogOpen(false);
              setSelectedProductId(null);
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}


