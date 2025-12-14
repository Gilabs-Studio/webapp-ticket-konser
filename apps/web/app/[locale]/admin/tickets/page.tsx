import { Suspense } from "react";
import { PageMotion } from "@/components/motion";
import { TicketsPageClient } from "./tickets-page-client";

export default function TicketsPage() {
  return (
    <PageMotion className="p-6">
      <Suspense fallback={null}>
        <TicketsPageClient />
      </Suspense>
    </PageMotion>
  );
}
