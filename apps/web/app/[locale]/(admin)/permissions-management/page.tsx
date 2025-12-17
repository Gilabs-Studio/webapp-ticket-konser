import { Suspense } from "react";
import { PageMotion } from "@/components/motion";
import dynamic from "next/dynamic";

const PermissionsPageClient = dynamic(
  () =>
    import("@/features/master-data/user-management/components/PermissionsPageClient").then(
      (mod) => ({ default: mod.PermissionsPageClient }),
    ),
  {
    loading: () => null,
  },
);

export default function PermissionsManagementPage() {
  return (
    <PageMotion className="p-6">
      <Suspense fallback={null}>
        <PermissionsPageClient />
      </Suspense>
    </PageMotion>
  );
}


