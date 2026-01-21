import { Suspense } from "react";
import { PageMotion } from "@/components/motion";
import dynamic from "next/dynamic";

const TicketDetailPageClient = dynamic(
  () =>
    import("./ticket-detail-page-client").then((mod) => ({
      default: mod.TicketDetailPageClient,
    })),
  {
    loading: () => null, // Use route-level loading.tsx
  },
);

interface TicketDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({
  params,
}: TicketDetailPageProps) {
  const { id } = await params;

  return (
    <PageMotion className="p-6">
      <Suspense fallback={null}>
        <TicketDetailPageClient ticketId={id} />
      </Suspense>
    </PageMotion>
  );
}




