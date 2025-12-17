import { Suspense } from "react";
import { PageMotion } from "@/components/motion";
import { EventsPageClient } from "./events-page-client";

export default function EventsPage() {
  return (
    <PageMotion className="p-6">
      <Suspense fallback={null}>
        <EventsPageClient />
      </Suspense>
    </PageMotion>
  );
}
