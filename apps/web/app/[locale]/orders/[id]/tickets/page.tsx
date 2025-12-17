import { Suspense } from "react";
import { PageMotion } from "@/components/motion";
import { OrderTicketsPageClient } from "./order-tickets-page-client";

interface OrderTicketsPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function OrderTicketsPage({
  params,
}: OrderTicketsPageProps) {
  const { id } = await params;

  return (
    <PageMotion className="p-6">
      <Suspense fallback={null}>
        <OrderTicketsPageClient orderId={id} />
      </Suspense>
    </PageMotion>
  );
}

