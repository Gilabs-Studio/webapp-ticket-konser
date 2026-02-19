import { Suspense } from "react";
import { PurchasePageClient } from "./purchase-page-client";
import { Skeleton } from "@/components/ui/skeleton";
import { PageWithHeaderLayout } from "@/components/layouts/PageWithHeaderLayout";

interface PurchasePageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function PurchasePage({ params }: PurchasePageProps) {
  const { id } = await params;

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
          <PurchasePageClient eventId={id} />
        </Suspense>
      </div>
    </PageWithHeaderLayout>
  );
}



