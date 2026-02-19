import { Suspense } from "react";
import { PublicEventDetailPageClient } from "./public-event-detail-page-client";
import { PageWithHeaderLayout } from "@/components/layouts/PageWithHeaderLayout";

interface PublicEventDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function PublicEventDetailPage({
  params,
}: PublicEventDetailPageProps) {
  const { id } = await params;

  return (
    <PageWithHeaderLayout>
      <div className="container mx-auto px-6 py-6">
        <Suspense fallback={null}>
          <PublicEventDetailPageClient eventId={id} />
        </Suspense>
      </div>
    </PageWithHeaderLayout>
  );
}



