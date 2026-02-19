"use client";

import { useState } from "react";
import { Search, Filter, Plus, MoreVertical, Eye, Trash2, Edit, Key } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "@/i18n/routing";
import { useRoles, useDeleteRole, useRole, useAssignPermissions, useUpdateRole, useCreateRole } from "../hooks/useRoles";
import { PermissionAssignment } from "./PermissionAssignment";
import { RoleForm } from "./RoleForm";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { CreateRoleFormData, UpdateRoleFormData } from "../types";

export function RolesPageClient() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
  const [assigningRoleId, setAssigningRoleId] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data, isLoading } = useRoles({ page, per_page: 20, search });
  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();
  const { mutate: updateRole, isPending: isUpdating } = useUpdateRole();
  const { mutate: createRole, isPending: isCreating } = useCreateRole();
  
  // Get role with permissions for assignment dialog
  const { data: roleForAssignment } = useRole(assigningRoleId || "", true);
  const { mutate: assignPermissions, isPending: isAssigning } = useAssignPermissions();
  
  // Get role for editing
  const { data: editingRoleData } = useRole(editingRoleId || "", false);

  const roles = data?.data ?? [];
  const pagination = data?.meta?.pagination;

  const handleSearchSubmit = () => {
    setSearch(searchQuery);
    setPage(1);
  };

  const handleDelete = (roleId: string) => {
    setDeletingRoleId(roleId);
  };

  const handleDeleteConfirm = () => {
    if (deletingRoleId) {
      deleteRole(deletingRoleId, {
        onSuccess: () => {
          toast.success("Role deleted successfully");
          setDeletingRoleId(null);
        },
      });
    }
  };

  const handleAssignPermissions = (roleId: string) => {
    setAssigningRoleId(roleId);
  };

  const handleSavePermissions = async (permissionIds: string[]) => {
    if (assigningRoleId) {
      assignPermissions(
        {
          id: assigningRoleId,
          data: { permission_ids: permissionIds },
        },
        {
          onSuccess: () => {
            toast.success("Permissions assigned successfully");
            setAssigningRoleId(null);
          },
        },
      );
    }
  };

  const handleEdit = (roleId: string) => {
    setEditingRoleId(roleId);
  };

  const handleCreate = async (formData: CreateRoleFormData) => {
    createRole(formData, {
      onSuccess: () => {
        toast.success("Role created successfully");
        setIsCreateDialogOpen(false);
      },
    });
  };

  const handleUpdate = async (formData: UpdateRoleFormData) => {
    if (editingRoleId) {
      updateRole(
        { id: editingRoleId, data: formData },
        {
          onSuccess: () => {
            toast.success("Role updated successfully");
            setEditingRoleId(null);
          },
        },
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearchSubmit();
              }
            }}
            className="max-w-sm"
          />
          <Button onClick={handleSearchSubmit} size="icon" variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Is Admin</TableHead>
              <TableHead>Can Login Admin</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No roles found</p>
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>
                    <code className="text-sm">{role.code}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.is_admin ? "default" : "secondary"}>
                      {role.is_admin ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.can_login_admin ? "default" : "secondary"}>
                      {role.can_login_admin ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/roles-management/${role.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAssignPermissions(role.id)}
                        >
                          <Key className="h-4 w-4 mr-2" />
                          Assign Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(role.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(role.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((page - 1) * 20) + 1} to{" "}
            {Math.min(page * 20, pagination.total)} of {pagination.total} roles
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={!pagination.has_prev}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!pagination.has_next}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Assign Permissions Dialog */}
      <Dialog open={!!assigningRoleId} onOpenChange={(open) => {
        if (!open) setAssigningRoleId(null);
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Assign Permissions</DialogTitle>
            <DialogDescription>
              Select permissions to assign to this role. Changes will be saved
              immediately.
            </DialogDescription>
          </DialogHeader>
          {assigningRoleId && (
            <PermissionAssignment
              roleId={assigningRoleId}
              currentPermissionIds={
                roleForAssignment?.data?.permissions?.map((p) => p.id) ?? []
              }
              onSave={handleSavePermissions}
              onCancel={() => setAssigningRoleId(null)}
              isLoading={isAssigning}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Role Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Role</DialogTitle>
            <DialogDescription>
              Add a new role to the system. Fill in the required information.
            </DialogDescription>
          </DialogHeader>
          <RoleForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={isCreating}
            isEdit={false}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingRoleId} onOpenChange={(open) => {
        if (!open) setEditingRoleId(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role information. Leave fields empty to keep current values.
            </DialogDescription>
          </DialogHeader>
          {editingRoleData?.data && (
            <RoleForm
              defaultValues={editingRoleData.data}
              onSubmit={handleUpdate}
              onCancel={() => setEditingRoleId(null)}
              isLoading={isUpdating}
              isEdit
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingRoleId} onOpenChange={(open) => {
        if (!open) setDeletingRoleId(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingRoleId(null)}>
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
    </div>
  );
}

