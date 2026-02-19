import { Skeleton } from "@/components/ui/skeleton";

export default function ScannerLoading() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>
      <Skeleton className="h-[600px] w-full rounded-md" />
    </div>
  );
}
