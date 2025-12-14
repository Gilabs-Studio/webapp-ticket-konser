import { Suspense } from "react";
import { PageMotion } from "@/components/motion";
import { ScannerPageClient } from "./scanner-page-client";

export default function ScannerPage() {
  return (
    <PageMotion className="p-4 md:p-6">
      <Suspense fallback={null}>
        <ScannerPageClient />
      </Suspense>
    </PageMotion>
  );
}
