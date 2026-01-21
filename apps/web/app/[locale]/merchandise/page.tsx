import { Suspense } from "react";
import { PageMotion } from "@/components/motion";
import { PublicMerchandisePageClient } from "./public-merchandise-page-client";

export default function PublicMerchandisePage() {
  return (
    <PageMotion className="p-6">
      <Suspense fallback={null}>
        <PublicMerchandisePageClient />
      </Suspense>
    </PageMotion>
  );
}



