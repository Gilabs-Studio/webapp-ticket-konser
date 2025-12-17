import { Skeleton } from "@/components/ui/skeleton";

export default function OrderTicketsLoading() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

