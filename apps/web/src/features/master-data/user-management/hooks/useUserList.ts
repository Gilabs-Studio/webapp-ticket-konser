"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useUsers, useUser, useCreateUser, useUpdateUser, useDeleteUser } from "./useUsers";
import type { CreateUserFormData, UpdateUserFormData } from "../types";

/**
 * Hook yang menggabungkan semua CRUD operations dan state management untuk user list
 * 
 * Pattern: Business logic di hook, UI di component
 * 
 * @example
 * ```tsx
 * export function UserList() {
 *   const {
 *     users,
 *     isLoading,
 *     handleCreate,
 *     handleUpdate,
 *     handleDelete,
 *   } = useUserList();
 * 
 *   return <div>...</div>;
 * }
 * ```
 */
export function useUserList() {
  // Pagination and filters state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [roleId, setRoleId] = useState<string>("");

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Data fetching
  const { data, isLoading } = useUsers({
    page,
    per_page: perPage,
    search,
    status,
    role_id: roleId,
  });

  // Get editing user data
  const { data: editingUserData } = useUser(editingUser || "");

  // Mutations
  const deleteUser = useDeleteUser();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  // Extract data
  const users = data?.data || [];
  const pagination = data?.meta?.pagination;

  /**
   * Handle create user
   */
  const handleCreate = async (formData: CreateUserFormData) => {
    try {
      await createUser.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      toast.success("User created successfully");
    } catch (error) {
      // Error already handled in api-client interceptor
      // Just re-throw to let component handle if needed
      throw error;
    }
  };

  /**
   * Handle update user
   */
  const handleUpdate = async (formData: UpdateUserFormData) => {
    if (editingUser) {
      try {
        await updateUser.mutateAsync({ id: editingUser, data: formData });
        setEditingUser(null);
        toast.success("User updated successfully");
      } catch (error) {
        // Error already handled in api-client interceptor
        throw error;
      }
    }
  };

  /**
   * Handle delete click - open confirmation dialog
   */
  const handleDeleteClick = (userId: string) => {
    setDeletingUserId(userId);
  };

  /**
   * Handle delete confirmation - actually delete the user
   */
  const handleDeleteConfirm = async () => {
    if (deletingUserId) {
      try {
        await deleteUser.mutateAsync(deletingUserId);
        setDeletingUserId(null);
        toast.success("User deleted successfully");
      } catch (error) {
        // Error already handled in api-client interceptor
        throw error;
      }
    }
  };

  /**
   * Handle delete cancel - close confirmation dialog
   */
  const handleDeleteCancel = () => {
    setDeletingUserId(null);
  };

  return {
    // State
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    status,
    setStatus,
    roleId,
    setRoleId,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    editingUser,
    setEditingUser,
    deletingUserId,
    setDeletingUserId,

    // Data
    users,
    pagination,
    editingUserData,
    isLoading,

    // Handlers
    handleCreate,
    handleUpdate,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,

    // Mutations (for loading states)
    deleteUser,
    createUser,
    updateUser,
  };
}


