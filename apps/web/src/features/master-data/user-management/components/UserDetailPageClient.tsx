"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { ArrowLeft, User, Shield, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "../hooks/useUsers";
import { useRole } from "../hooks/useRoles";
import { useUserPermissions } from "../hooks/useUserPermissions";
import { getInitials } from "./UserList";

interface UserDetailPageClientProps {
  readonly userId: string;
}

export function UserDetailPageClient({ userId }: UserDetailPageClientProps) {
  const router = useRouter();
  const { data: userData, isLoading: isLoadingUser } = useUser(userId);
  const user = userData?.data;

  const { data: roleData, isLoading: isLoadingRole } = useRole(
    user?.role_id || "",
    true, // include permissions
  );
  const role = roleData?.data;

  const { data: permissionsData, isLoading: isLoadingPermissions } =
    useUserPermissions();
  const userPermissions = permissionsData?.data?.permissions ?? [];

  const isLoading = isLoadingUser || isLoadingRole || isLoadingPermissions;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">User not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rolePermissions = role?.permissions ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">User Details</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage user information, role, and permissions
          </p>
        </div>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="text-lg">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge
                variant={user.status === "active" ? "default" : "secondary"}
                className="mt-1"
              >
                {user.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="mt-1 font-medium">
                {user.role?.name || role?.name || "No role assigned"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="role" className="space-y-4">
        <TabsList>
          <TabsTrigger value="role">
            <Shield className="h-4 w-4 mr-2" />
            Role Access
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Key className="h-4 w-4 mr-2" />
            Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="role" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {role ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Role Name</p>
                    <p className="mt-1 font-medium">{role.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role Code</p>
                    <p className="mt-1 font-mono text-sm">{role.code}</p>
                  </div>
                  {role.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Description
                      </p>
                      <p className="mt-1">{role.description}</p>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Is Admin</p>
                      <Badge
                        variant={role.is_admin ? "default" : "secondary"}
                        className="mt-1"
                      >
                        {role.is_admin ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Can Login Admin
                      </p>
                      <Badge
                        variant={
                          role.can_login_admin ? "default" : "secondary"
                        }
                        className="mt-1"
                      >
                        {role.can_login_admin ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No role assigned
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              {rolePermissions.length > 0 ? (
                <div className="space-y-2">
                  {rolePermissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between p-3 border rounded-md"
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
                <p className="text-sm text-muted-foreground">
                  No permissions assigned
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}




