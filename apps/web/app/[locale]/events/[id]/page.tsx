import { Suspense } from "react";
import { PageMotion } from "@/components/motion";
import { PublicEventDetailPageClient } from "./public-event-detail-page-client";

interface PublicEventDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function PublicEventDetailPage({
  params,
}: PublicEventDetailPageProps) {
  const { id } = await params;

  return (
    <PageMotion className="p-6">
      <Suspense fallback={null}>
        <PublicEventDetailPageClient eventId={id} />
      </Suspense>
    </PageMotion>
  );
}
