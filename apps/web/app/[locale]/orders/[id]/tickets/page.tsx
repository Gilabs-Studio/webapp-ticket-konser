import { Suspense } from "react";
import { OrderTicketsPageClient } from "./order-tickets-page-client";
import { PageWithHeaderLayout } from "@/components/layouts/PageWithHeaderLayout";

interface OrderTicketsPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function OrderTicketsPage({
  params,
}: OrderTicketsPageProps) {
  const { id } = await params;

  return (
    <PageWithHeaderLayout>
      <div className="container mx-auto px-6 py-6">
        <Suspense fallback={null}>
          <OrderTicketsPageClient orderId={id} />
        </Suspense>
      </div>
    </PageWithHeaderLayout>
  );
}



