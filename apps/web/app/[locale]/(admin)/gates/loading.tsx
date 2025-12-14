import { Skeleton } from "@/components/ui/skeleton";

export default function GatesLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="border border-border bg-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/50">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
