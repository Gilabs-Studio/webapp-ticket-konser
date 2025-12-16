"use client";

import { useState, useEffect } from "react";
import { Search, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions } from "../hooks/usePermissions";
import type { Permission } from "../types";

interface PermissionAssignmentProps {
  readonly roleId: string;
  readonly currentPermissionIds: string[];
  readonly onSave: (permissionIds: string[]) => Promise<void>;
  readonly onCancel: () => void;
  readonly isLoading?: boolean;
}

export function PermissionAssignment({
  roleId,
  currentPermissionIds,
  onSave,
  onCancel,
  isLoading = false,
}: PermissionAssignmentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    currentPermissionIds,
  );
  const [isSaving, setIsSaving] = useState(false);

  const { data: permissionsData, isLoading: isLoadingPermissions } =
    usePermissions({ per_page: 100 });

  const permissions = permissionsData?.data ?? [];

  // Group permissions by resource
  const groupedPermissions = permissions.reduce(
    (acc, permission) => {
      const resource = permission.resource;
      if (!acc[resource]) {
        acc[resource] = [];
      }
      acc[resource].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>,
  );

  // Filter permissions by search query
  const filteredPermissions = searchQuery
    ? permissions.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.resource.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : permissions;

  // Filter grouped permissions by search query
  const filteredGroupedPermissions = searchQuery
    ? Object.entries(groupedPermissions).reduce(
        (acc, [resource, perms]) => {
          const filtered = perms.filter(
            (p) =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.resource.toLowerCase().includes(searchQuery.toLowerCase()),
          );
          if (filtered.length > 0) {
            acc[resource] = filtered;
          }
          return acc;
        },
        {} as Record<string, Permission[]>,
      )
    : groupedPermissions;

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissionIds((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId);
      }
      return [...prev, permissionId];
    });
  };

  const handleSelectAll = () => {
    if (selectedPermissionIds.length === filteredPermissions.length) {
      setSelectedPermissionIds([]);
    } else {
      setSelectedPermissionIds(filteredPermissions.map((p) => p.id));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedPermissionIds);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    selectedPermissionIds.length !== currentPermissionIds.length ||
    selectedPermissionIds.some((id) => !currentPermissionIds.includes(id)) ||
    currentPermissionIds.some((id) => !selectedPermissionIds.includes(id));

  if (isLoadingPermissions) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Search permissions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
          disabled={filteredPermissions.length === 0}
        >
          {selectedPermissionIds.length === filteredPermissions.length &&
          filteredPermissions.length > 0
            ? "Deselect All"
            : "Select All"}
        </Button>
      </div>

      {/* Selected count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {selectedPermissionIds.length} of {permissions.length} permissions
          selected
        </span>
        {hasChanges && (
          <Badge variant="outline" className="text-xs">
            Unsaved changes
          </Badge>
        )}
      </div>

      {/* Permissions List */}
      <ScrollArea className="h-[400px] border rounded-lg p-4">
        {searchQuery ? (
          // Flat list when searching
          <div className="space-y-2">
            {filteredPermissions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No permissions found
              </p>
            ) : (
              filteredPermissions.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent"
                >
                  <Checkbox
                    checked={selectedPermissionIds.includes(permission.id)}
                    onCheckedChange={() =>
                      handleTogglePermission(permission.id)
                    }
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{permission.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {permission.code}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {permission.resource}.{permission.action}
                  </Badge>
                </div>
              ))
            )}
          </div>
        ) : (
          // Grouped by resource when not searching
          <div className="space-y-4">
            {Object.entries(filteredGroupedPermissions).map(
              ([resource, perms]) => (
                <div key={resource} className="space-y-2">
                  <div className="font-semibold text-sm text-muted-foreground uppercase">
                    {resource}
                  </div>
                  <div className="space-y-1 pl-4">
                    {perms.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent"
                      >
                        <Checkbox
                          checked={selectedPermissionIds.includes(permission.id)}
                          onCheckedChange={() =>
                            handleTogglePermission(permission.id)
                          }
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {permission.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {permission.code}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {permission.action}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </ScrollArea>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving || isLoading || !hasChanges}
        >
          {isSaving ? "Saving..." : "Save Permissions"}
        </Button>
      </div>
    </div>
  );
}

