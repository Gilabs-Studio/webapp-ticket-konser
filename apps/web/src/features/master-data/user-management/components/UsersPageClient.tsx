"use client";

import { Users, Shield, Key } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserList } from "./UserList";
import { RolesPageClient } from "./RolesPageClient";
import { PermissionsPageClient } from "./PermissionsPageClient";

export function UsersPageClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage users, roles, and permissions
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="h-4 w-4 mr-2" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Key className="h-4 w-4 mr-2" />
            Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UserList />
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <RolesPageClient />
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <PermissionsPageClient />
        </TabsContent>
      </Tabs>
    </div>
  );
}

