"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TicketList } from "./TicketList";
import { RecentOrdersTable } from "./RecentOrdersTable";
import { type TicketType, type Order } from "../types";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TicketCategoryForm } from "./TicketCategoryForm";
import { useTicketCategory, useDeleteTicketCategory } from "../hooks/useTicketCategories";
import { Skeleton } from "@/components/ui/skeleton";

interface TicketManagementProps {
  readonly tickets?: TicketType[];
  readonly orders?: Order[];
  readonly isLoadingTickets?: boolean;
  readonly isLoadingOrders?: boolean;
  readonly onCreateType?: () => void;
  readonly onEditTicket?: (ticket: TicketType) => void;
  readonly onMoreTicket?: (ticket: TicketType) => void;
  readonly onViewAllOrders?: () => void;
}

export function TicketManagement({
  tickets,
  orders,
  isLoadingTickets,
  isLoadingOrders,
  onCreateType,
  onEditTicket,
  onMoreTicket,
  onViewAllOrders,
}: TicketManagementProps) {
  const t = useTranslations("tickets");

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const { mutate: deleteTicketCategory, isPending: isDeleting } =
    useDeleteTicketCategory();

  const handleCreate = () => {
    if (onCreateType) {
      onCreateType();
    } else {
      setCreateDialogOpen(true);
    }
  };

  const handleEdit = (ticket: TicketType) => {
    if (onEditTicket) {
      onEditTicket(ticket);
    } else {
      setSelectedTicketId(ticket.id);
      setEditDialogOpen(true);
    }
  };

  const handleMore = (ticket: TicketType) => {
    if (onMoreTicket) {
      onMoreTicket(ticket);
    } else {
      setSelectedTicketId(ticket.id);
      // Open dropdown menu - handled by TicketCard
    }
  };

  const handleDelete = (id: string) => {
    setSelectedTicketId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedTicketId) {
      deleteTicketCategory(selectedTicketId, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedTicketId(null);
        },
      });
    }
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    // Query will be refetched automatically by useTicketCategories hook
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setSelectedTicketId(null);
    // Query will be refetched automatically by useTicketCategories hook
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex justify-between items-center"
      >
        <h2 className="text-lg font-medium text-foreground tracking-tight">
          {t("title")}
        </h2>
        <Button
          variant="default"
          size="sm"
          onClick={handleCreate}
          className="text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          {t("createType")}
        </Button>
      </motion.div>

      <TicketList
        tickets={tickets}
        isLoading={isLoadingTickets}
        onEdit={handleEdit}
        onMore={handleMore}
        onDelete={handleDelete}
      />

      <RecentOrdersTable
        orders={orders}
        isLoading={isLoadingOrders}
        onViewAll={onViewAllOrders}
      />

      {/* Create Ticket Category Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Ticket Category</DialogTitle>
            <DialogDescription>
              Add a new ticket category to the system. Fill in the required information below.
            </DialogDescription>
          </DialogHeader>
          <TicketCategoryForm
            inDialog
            onCancel={() => setCreateDialogOpen(false)}
            onSuccess={handleCreateSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Ticket Category Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Ticket Category</DialogTitle>
            <DialogDescription>
              Update ticket category information. Make your changes below.
            </DialogDescription>
          </DialogHeader>
          {selectedTicketId && (
            <EditTicketCategoryForm
              ticketCategoryId={selectedTicketId}
              inDialog
              onCancel={() => {
                setEditDialogOpen(false);
                setSelectedTicketId(null);
              }}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ticket Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this ticket category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedTicketId(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// Edit Ticket Category Form Component (fetches ticket category data first)
function EditTicketCategoryForm({
  ticketCategoryId,
  inDialog = false,
  onCancel,
  onSuccess,
}: {
  readonly ticketCategoryId: string;
  readonly inDialog?: boolean;
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
}) {
  const { data: ticketCategoryData, isLoading } = useTicketCategory(ticketCategoryId);
  const ticketCategory = ticketCategoryData?.data;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!ticketCategory) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">Ticket category not found</p>
      </div>
    );
  }

  return (
    <TicketCategoryForm
      ticketCategoryId={ticketCategoryId}
      inDialog={inDialog}
      defaultValues={{
        category_name: ticketCategory.category_name,
        price: ticketCategory.price,
        quota: ticketCategory.quota,
        limit_per_user: ticketCategory.limit_per_user,
      }}
      onCancel={onCancel}
      onSuccess={onSuccess}
    />
  );
}
