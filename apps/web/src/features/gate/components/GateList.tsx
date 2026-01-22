"use client";

import { useState } from "react";
import { Search, Filter, Plus, MoreVertical, DoorOpen, Eye, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGates, useDeleteGate, useGate } from "../hooks/useGates";
import type { Gate, GateFilters } from "../types";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GateForm } from "./GateForm";
import { GateDetail } from "./GateDetail";

interface GateListProps {
  readonly filters?: GateFilters;
}

function getStatusBadgeVariant(
  status: Gate["status"],
): "default" | "secondary" | "destructive" {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "INACTIVE":
      return "secondary";
    default:
      return "secondary";
  }
}

function getStatusLabel(status: Gate["status"]): string {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "INACTIVE":
      return "Inactive";
    default:
      return status;
  }
}

export function GateList({ filters }: GateListProps) {
  const [searchQuery, setSearchQuery] = useState(filters?.search ?? "");
  const [currentPage, setCurrentPage] = useState(filters?.page ?? 1);
  const [statusFilter, setStatusFilter] = useState<
    Gate["status"] | "all"
  >(filters?.status ?? "all");
  const [isVIPFilter, setIsVIPFilter] = useState<boolean | "all">(
    filters?.is_vip ?? "all",
  );

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedGateId, setSelectedGateId] = useState<string | null>(null);

  const activeFilters: GateFilters = {
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    is_vip: isVIPFilter !== "all" ? isVIPFilter : undefined,
    page: currentPage,
    per_page: 20,
  };

  const { data, isLoading, isError, error } = useGates(activeFilters);
  const { mutate: deleteGate, isPending: isDeleting } = useDeleteGate();

  const gates = data?.data ?? [];
  const pagination = data?.meta?.pagination;

  const hasActiveFilters = statusFilter !== "all" || isVIPFilter !== "all";

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as Gate["status"] | "all");
    setCurrentPage(1);
  };

  const handleVIPFilterChange = (value: string) => {
    if (value === "all") {
      setIsVIPFilter("all");
    } else {
      setIsVIPFilter(value === "true");
    }
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setStatusFilter("all");
    setIsVIPFilter("all");
    setCurrentPage(1);
  };

  const handleDelete = (id: string) => {
    setSelectedGateId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedGateId) {
      deleteGate(selectedGateId, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedGateId(null);
        },
      });
    }
  };

  const handleEdit = (id: string) => {
    setSelectedGateId(id);
    setEditDialogOpen(true);
  };

  const handleView = (id: string) => {
    setSelectedGateId(id);
    setViewDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setSelectedGateId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="border border-border bg-card rounded-md overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/50">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Gate Management</h2>
        </div>
        <div className="border border-border bg-card rounded-md p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Failed to load gates. Please try again.
          </p>
          {error instanceof Error && (
            <p className="text-xs text-muted-foreground mt-2">
              {error.message}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex justify-between items-center"
      >
        <h2 className="text-lg font-medium tracking-tight">Gate Management</h2>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <Filter className="h-3.5 w-3.5 mr-2" />
                Filter
                {hasActiveFilters && (
                  <Badge
                    variant="default"
                    className="ml-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[8px]"
                  >
                    {(statusFilter !== "all" ? 1 : 0) +
                      (isVIPFilter !== "all" ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Filters</h4>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={handleResetFilters}
                    >
                      Reset
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Status</Label>
                    <Select
                      value={statusFilter}
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">VIP Gate</Label>
                    <Select
                      value={
                        isVIPFilter === "all"
                          ? "all"
                          : isVIPFilter
                            ? "true"
                            : "false"
                      }
                      onValueChange={handleVIPFilterChange}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Gates</SelectItem>
                        <SelectItem value="true">VIP Only</SelectItem>
                        <SelectItem value="false">Regular Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-2" />
            Add Gate
          </Button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="border border-border bg-card rounded-md overflow-hidden"
      >
        <div className="p-4 border-b border-border bg-muted/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search gates by name, code, or location..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* Table */}
        {gates.length === 0 ? (
          <div className="p-8 text-center">
            <DoorOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No gates found. Create your first gate to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[100px]">Capacity</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gates.map((gate) => (
                  <TableRow key={gate.id}>
                    <TableCell className="font-mono text-xs">
                      {gate.code}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{gate.name}</span>
                        {gate.description && (
                          <span className="text-xs text-muted-foreground">
                            {gate.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {gate.location ?? "N/A"}
                    </TableCell>
                    <TableCell>
                      {gate.is_vip ? (
                        <Badge variant="default" className="text-xs">
                          VIP
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Regular
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(gate.status)}
                        className="text-xs"
                      >
                        {getStatusLabel(gate.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {gate.capacity === 0 ? "Unlimited" : gate.capacity}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleView(gate.id)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(gate.id)}
                          >
                            <Edit className="h-3.5 w-3.5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(gate.id)}
                            className="text-destructive"
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="p-4 border-t border-border bg-muted/50 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {((currentPage - 1) * (pagination.per_page ?? 20)) + 1} to{" "}
              {Math.min(
                currentPage * (pagination.per_page ?? 20),
                pagination.total,
              )}{" "}
              of {pagination.total} gates
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.has_prev}
                className="text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(pagination.total_pages, p + 1),
                  )
                }
                disabled={!pagination.has_next}
                className="text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Create Gate Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Gate</DialogTitle>
            <DialogDescription>
              Add a new gate to the system. Fill in the required information below.
            </DialogDescription>
          </DialogHeader>
          <GateForm
            inDialog
            onCancel={() => setCreateDialogOpen(false)}
            onSuccess={handleCreateSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Gate Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Gate</DialogTitle>
            <DialogDescription>
              Update gate information. Make your changes below.
            </DialogDescription>
          </DialogHeader>
          {selectedGateId && (
            <EditGateForm
              gateId={selectedGateId}
              inDialog
              onCancel={() => {
                setEditDialogOpen(false);
                setSelectedGateId(null);
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
            <DialogTitle>Delete Gate</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this gate? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedGateId(null);
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

      {/* View Gate Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gate Details</DialogTitle>
            <DialogDescription>
              View detailed information and statistics for this gate.
            </DialogDescription>
          </DialogHeader>
          {selectedGateId && <GateDetail gateId={selectedGateId} />}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// Edit Gate Form Component (fetches gate data first)
function EditGateForm({
  gateId,
  inDialog = false,
  onCancel,
  onSuccess,
}: {
  readonly gateId: string;
  readonly inDialog?: boolean;
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
}) {
  const { data: gateData, isLoading } = useGate(gateId);
  const gate = gateData?.data;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!gate) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">Gate not found</p>
      </div>
    );
  }

  return (
    <GateForm
      gateId={gateId}
      inDialog={inDialog}
      defaultValues={{
        code: gate.code,
        name: gate.name,
        location: gate.location ?? "",
        description: gate.description ?? "",
        is_vip: gate.is_vip,
        status: gate.status,
        capacity: gate.capacity,
      }}
      onCancel={onCancel}
      onSuccess={onSuccess}
    />
  );
}
