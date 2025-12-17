import { Suspense } from "react";
import { PageMotion } from "@/components/motion";
import { MyOrdersPageClient } from "./my-orders-page-client";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyOrdersPage() {
  return (
    <PageMotion className="p-6">
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-96 w-full" />
          </div>
        }
      >
        <MyOrdersPageClient />
      </Suspense>
    </PageMotion>
  );
}


