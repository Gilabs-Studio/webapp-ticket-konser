import { Suspense } from "react";
import { PageMotion } from "@/components/motion";
import { OrdersPageClient } from "./orders-page-client";

export default function OrdersPage() {
  return (
    <PageMotion className="p-6">
      <Suspense fallback={null}>
        <OrdersPageClient />
      </Suspense>
    </PageMotion>
  );
}

