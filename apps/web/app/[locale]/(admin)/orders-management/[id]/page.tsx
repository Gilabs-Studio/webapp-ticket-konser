import { Suspense } from "react";
import { PageMotion } from "@/components/motion";
import { OrderDetailPageClient } from "./order-detail-page-client";

interface OrderDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;

  return (
    <PageMotion className="p-6">
      <Suspense fallback={null}>
        <OrderDetailPageClient orderId={id} />
      </Suspense>
    </PageMotion>
  );
}


