import { Suspense } from "react";
import { PageMotion } from "@/components/motion";
import { EventDetailPageClient } from "./event-detail-page-client";

interface EventDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { id } = await params;

  return (
    <PageMotion className="p-6">
      <Suspense fallback={null}>
        <EventDetailPageClient eventId={id} />
      </Suspense>
    </PageMotion>
  );
}
