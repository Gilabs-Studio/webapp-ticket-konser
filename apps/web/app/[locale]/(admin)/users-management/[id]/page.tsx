import { Suspense } from "react";
import { PageMotion } from "@/components/motion";
import dynamic from "next/dynamic";

const UserDetailPageClient = dynamic(
  () =>
    import("@/features/master-data/user-management/components/UserDetailPageClient").then(
      (mod) => ({ default: mod.UserDetailPageClient }),
    ),
  {
    loading: () => null,
  },
);

interface UserDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  return (
    <PageMotion className="p-6">
      <Suspense fallback={null}>
        <UserDetailPageClient userId={id} />
      </Suspense>
    </PageMotion>
  );
}


