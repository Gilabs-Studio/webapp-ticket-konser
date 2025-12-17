import { Suspense } from "react";
import { PageMotion } from "@/components/motion";
import { OrderDetailPageClient } from "./order-detail-page-client";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;

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
        <OrderDetailPageClient orderId={id} />
      </Suspense>
    </PageMotion>
  );
}


