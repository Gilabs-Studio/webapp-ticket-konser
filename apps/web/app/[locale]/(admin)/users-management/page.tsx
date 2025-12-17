import { Suspense } from "react";
import { PageMotion } from "@/components/motion";
import dynamic from "next/dynamic";

const UsersPageClient = dynamic(
  () =>
    import("@/features/master-data/user-management/components/UsersPageClient").then(
      (mod) => ({ default: mod.UsersPageClient }),
    ),
  {
    loading: () => null, // Use route-level loading.tsx
  },
);

export default function UsersManagementPage() {
  return (
    <PageMotion className="p-6">
      <Suspense fallback={null}>
        <UsersPageClient />
      </Suspense>
    </PageMotion>
  );
}


