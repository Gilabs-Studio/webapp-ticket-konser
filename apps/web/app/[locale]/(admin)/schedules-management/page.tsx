import { Suspense } from "react";
import { PageMotion } from "@/components/motion";
import { SchedulesPageClient } from "./schedules-page-client";

export default function SchedulesPage() {
  return (
    <PageMotion className="p-6">
      <Suspense fallback={null}>
        <SchedulesPageClient />
      </Suspense>
    </PageMotion>
  );
}

