import { Suspense } from "react";
import { PageMotion } from "@/components/motion";
import { CheckInsPageClient } from "./check-ins-page-client";

export default function CheckInsPage() {
  return (
    <PageMotion className="p-6">
      <Suspense fallback={null}>
        <CheckInsPageClient />
      </Suspense>
    </PageMotion>
  );
}
