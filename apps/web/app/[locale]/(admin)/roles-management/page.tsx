import { Suspense } from "react";
import { PageMotion } from "@/components/motion";
import dynamic from "next/dynamic";

const RolesPageClient = dynamic(
  () =>
    import("@/features/master-data/user-management/components/RolesPageClient").then(
      (mod) => ({ default: mod.RolesPageClient }),
    ),
  {
    loading: () => null,
  },
);

export default function RolesManagementPage() {
  return (
    <PageMotion className="p-6">
      <Suspense fallback={null}>
        <RolesPageClient />
      </Suspense>
    </PageMotion>
  );
}

