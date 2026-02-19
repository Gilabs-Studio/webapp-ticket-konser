import { Suspense } from "react";
import { PublicEventsPageClient } from "./public-events-page-client";
import { PageWithHeaderLayout } from "@/components/layouts/PageWithHeaderLayout";

export default function PublicEventsPage() {
  return (
    <PageWithHeaderLayout>
      <div className="container mx-auto px-6 py-6">
        <Suspense fallback={null}>
          <PublicEventsPageClient />
        </Suspense>
      </div>
    </PageWithHeaderLayout>
  );
}



