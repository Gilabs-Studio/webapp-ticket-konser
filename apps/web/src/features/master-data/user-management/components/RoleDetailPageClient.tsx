"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { ArrowLeft, Shield, Key, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRole, useAssignPermissions } from "../hooks/useRoles";
import { PermissionAssignment } from "./PermissionAssignment";
import { toast } from "sonner";

interface RoleDetailPageClientProps {
  readonly roleId: string;
}

export function RoleDetailPageClient({ roleId }: RoleDetailPageClientProps) {
  const router = useRouter();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const { data: roleData, isLoading: isLoadingRole } = useRole(roleId, true);
  const { mutate: assignPermissions, isPending: isAssigning } =
    useAssignPermissions();

  const role = roleData?.data;
  const rolePermissions = role?.permissions ?? [];

  const handleAssignPermissions = async (permissionIds: string[]) => {
    assignPermissions(
      {
        id: roleId,
        data: { permission_ids: permissionIds },
      },
      {
        onSuccess: () => {
          toast.success("Permissions assigned successfully");
          setIsAssignDialogOpen(false);
        },
      },
    );
  };

  if (isLoadingRole) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Role not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Role Details</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage role information and permissions
          </p>
        </div>
      </div>

      {/* Role Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{role.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                <code>{role.code}</code>
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant={role.is_admin ? "default" : "secondary"}>
                {role.is_admin ? "Admin" : "Regular"}
              </Badge>
              <Badge
                variant={role.can_login_admin ? "default" : "secondary"}
              >
                {role.can_login_admin ? "Can Login Admin" : "Cannot Login Admin"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {role.description && (
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="mt-1">{role.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="permissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="permissions">
            <Key className="h-4 w-4 mr-2" />
            Permissions ({rolePermissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Role Permissions</CardTitle>
                <Button
                  onClick={() => setIsAssignDialogOpen(true)}
                  size="sm"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Permissions
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {rolePermissions.length > 0 ? (
                <div className="space-y-2">
                  {rolePermissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{permission.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {permission.code}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {permission.resource}.{permission.action}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No permissions assigned to this role
                  </p>
                  <Button
                    onClick={() => setIsAssignDialogOpen(true)}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    Assign Permissions
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assign Permissions Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
            <DialogDescription>
              Select permissions to assign to this role. Changes will be saved
              immediately.
            </DialogDescription>
          </DialogHeader>
          <PermissionAssignment
            roleId={roleId}
            currentPermissionIds={rolePermissions.map((p) => p.id)}
            onSave={handleAssignPermissions}
            onCancel={() => setIsAssignDialogOpen(false)}
            isLoading={isAssigning}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}


