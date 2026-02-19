import { Suspense } from "react";
import { MyOrdersPageClient } from "./my-orders-page-client";
import { Skeleton } from "@/components/ui/skeleton";
import { PageWithHeaderLayout } from "@/components/layouts/PageWithHeaderLayout";

export default function MyOrdersPage() {
  return (
    <PageWithHeaderLayout>
      <div className="container mx-auto px-6 py-6">
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
      </div>
    </PageWithHeaderLayout>
  );
}




