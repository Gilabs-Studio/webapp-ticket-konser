"use client";

import { MapPin, Users, TrendingUp, CheckCircle2, XCircle, UserPlus, UserMinus, UserCheck, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGate, useGateStatistics, useAssignedStaff, useUnassignStaffFromGate, useAssignStaffToGate } from "../hooks/useGates";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useUsers } from "@/features/master-data/user-management/hooks/useUsers";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GateDetailProps {
  readonly gateId: string;
}

function getStatusBadgeVariant(
  status: "ACTIVE" | "INACTIVE",
): "default" | "secondary" {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "INACTIVE":
      return "secondary";
    default:
      return "secondary";
  }
}

function getStatusLabel(status: "ACTIVE" | "INACTIVE"): string {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "INACTIVE":
      return "Inactive";
    default:
      return status;
  }
}

export function GateDetail({ gateId }: GateDetailProps) {
  const { data: gateData, isLoading: isLoadingGate } = useGate(gateId);
  const { data: statsData, isLoading: isLoadingStats } =
    useGateStatistics(gateId);

  const gate = gateData?.data;
  const statistics = statsData?.data;

  if (isLoadingGate) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
        <Separator />
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
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
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold">{gate.name}</h3>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">
          {gate.code}
        </p>
      </div>

      <Separator />

      {/* Gate Information */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Status</span>
          <Badge
            variant={getStatusBadgeVariant(gate.status)}
            className="text-xs"
          >
            {gate.status === "ACTIVE" ? (
              <CheckCircle2 className="h-3 w-3 mr-1" />
            ) : (
              <XCircle className="h-3 w-3 mr-1" />
            )}
            {getStatusLabel(gate.status)}
          </Badge>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Type</span>
          {gate.is_vip ? (
            <Badge variant="default" className="text-xs">
              VIP Gate
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              Regular Gate
            </Badge>
          )}
        </div>

        {gate.location && (
          <>
            <Separator />
            <div className="flex items-start justify-between gap-4">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                Location
              </span>
              <span className="text-xs text-right max-w-[60%]">
                {gate.location}
              </span>
            </div>
          </>
        )}

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Users className="h-3 w-3" />
            Capacity
          </span>
          <span className="text-xs font-medium">
            {gate.capacity === 0 ? "Unlimited" : gate.capacity.toLocaleString("id-ID")}
          </span>
        </div>

        {gate.description && (
          <>
            <Separator />
            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground">Description</span>
              <p className="text-xs leading-relaxed">{gate.description}</p>
            </div>
          </>
        )}
      </div>

      {/* Statistics */}
      {statistics && (
        <>
          <Separator className="my-4" />
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" />
              Statistics
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Total Check-ins
                </p>
                <p className="text-lg font-semibold">
                  {statistics.total_check_ins}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Today Check-ins
                </p>
                <p className="text-lg font-semibold">
                  {statistics.today_check_ins}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">VIP</p>
                <p className="text-base font-semibold">
                  {statistics.vip_check_ins}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Regular</p>
                <p className="text-base font-semibold">
                  {statistics.regular_check_ins}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {isLoadingStats && (
        <>
          <Separator className="my-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </>
      )}

      {/* Staff Management Section */}
      <Separator className="my-4" />
      <StaffManagementSection gateId={gateId} />
    </div>
  );
}

// Staff Management Section
function StaffManagementSection({ gateId }: { readonly gateId: string }) {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const { data: staffData, isLoading } = useAssignedStaff(gateId);
  const { mutate: unassignStaff, isPending: isUnassigning } = useUnassignStaffFromGate();

  const assignedStaff = staffData?.data ?? [];

  const handleUnassign = (staffId: string) => {
    unassignStaff({ gateId, staffId });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          Assigned Staff
        </h4>

        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-7 text-[10px] px-2">
              <UserPlus className="h-3 w-3 mr-1" />
              Assign Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Staff to Gate</DialogTitle>
              <DialogDescription>
                Search and select staff members to assign to this gate.
              </DialogDescription>
            </DialogHeader>
            <AssignStaffDialogContent
              gateId={gateId}
              onSuccess={() => setIsAssignDialogOpen(false)}
              assignedIds={assignedStaff.map(s => s.id)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : assignedStaff.length === 0 ? (
        <div className="bg-muted/30 border border-dashed rounded-lg p-4 text-center">
          <p className="text-xs text-muted-foreground">No staff assigned to this gate.</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {assignedStaff.map((staff) => (
            <div
              key={staff.id}
              className="flex items-center justify-between p-2 rounded-md border bg-card/50 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7 border">
                  <AvatarImage src={staff.avatar_url} />
                  <AvatarFallback className="text-[10px]">
                    {staff.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-xs font-medium">{staff.name}</span>
                  <span className="text-[10px] text-muted-foreground">{staff.email}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => handleUnassign(staff.id)}
                disabled={isUnassigning}
              >
                <UserMinus className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AssignStaffDialogContent({
  gateId,
  onSuccess,
  assignedIds
}: {
  readonly gateId: string;
  readonly onSuccess: () => void;
  readonly assignedIds: string[];
}) {
  const [search, setSearch] = useState("");
  // Assuming 'staff_ticket' role code for filtering staff
  // In a real app, you might want to fetch role list first or use a known code
  const { data: userData, isLoading } = useUsers({ search });
  const { mutate: assignStaff, isPending: isAssigning } = useAssignStaffToGate();

  const users = userData?.data ?? [];
  // Filter for staff roles (adjust as needed based on your role system)
  const availableStaff = users.filter(u =>
    !assignedIds.includes(u.id) &&
    (u.role?.name?.toLowerCase().includes("staff") || u.role?.code?.toLowerCase().includes("staff"))
  );

  const handleAssign = (staffId: string) => {
    assignStaff({ gateId, staffId }, {
      onSuccess: () => {
        onSuccess();
      }
    });
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search staff by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <ScrollArea className="h-64 pr-4">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : availableStaff.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              {search ? "No staff found matching your search." : "No available staff found."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {availableStaff.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() => handleAssign(user.id)}
                  disabled={isAssigning}
                >
                  {isAssigning ? "..." : "Assign"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
