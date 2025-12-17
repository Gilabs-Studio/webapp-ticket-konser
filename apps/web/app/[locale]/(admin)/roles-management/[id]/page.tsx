import { Suspense } from "react";
import { PageMotion } from "@/components/motion";
import dynamic from "next/dynamic";

const RoleDetailPageClient = dynamic(
  () =>
    import("@/features/master-data/user-management/components/RoleDetailPageClient").then(
      (mod) => ({ default: mod.RoleDetailPageClient }),
    ),
  {
    loading: () => null,
  },
);

interface RoleDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function RoleDetailPage({ params }: RoleDetailPageProps) {
  const { id } = await params;
  return (
    <PageMotion className="p-6">
      <Suspense fallback={null}>
        <RoleDetailPageClient roleId={id} />
      </Suspense>
    </PageMotion>
  );
}


