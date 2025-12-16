import { Skeleton } from "@/components/ui/skeleton";

export default function EventDetailLoading() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="aspect-video w-full rounded-xl" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
