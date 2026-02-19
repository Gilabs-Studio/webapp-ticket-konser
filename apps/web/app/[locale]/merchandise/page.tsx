import { Suspense } from "react";
import { PublicMerchandisePageClient } from "./public-merchandise-page-client";
import { PageWithHeaderLayout } from "@/components/layouts/PageWithHeaderLayout";

export default function PublicMerchandisePage() {
  return (
    <PageWithHeaderLayout>
      <div className="container mx-auto px-6 py-6">
        <Suspense fallback={null}>
          <PublicMerchandisePageClient />
        </Suspense>
      </div>
    </PageWithHeaderLayout>
  );
}



