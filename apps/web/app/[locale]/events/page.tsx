import { Suspense } from "react";
import { PageMotion } from "@/components/motion";
import { PublicEventsPageClient } from "./public-events-page-client";

export default function PublicEventsPage() {
  return (
    <PageMotion className="p-6">
      <Suspense fallback={null}>
        <PublicEventsPageClient />
      </Suspense>
    </PageMotion>
  );
}



