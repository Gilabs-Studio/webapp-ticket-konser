import { Skeleton } from "@/components/ui/skeleton";

export default function UsersManagementLoading() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-10 w-32" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}




