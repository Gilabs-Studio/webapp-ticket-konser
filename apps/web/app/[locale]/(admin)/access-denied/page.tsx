import { Suspense } from "react";
import { PageMotion } from "@/components/motion";
import dynamic from "next/dynamic";

const AccessDeniedPageClient = dynamic(
  () =>
    import("@/features/master-data/user-management/components/AccessDeniedPageClient").then(
      (mod) => ({ default: mod.AccessDeniedPageClient }),
    ),
  {
    loading: () => null,
  },
);

export default function AccessDeniedPage() {
  return (
    <PageMotion className="p-6">
      <Suspense fallback={null}>
        <AccessDeniedPageClient />
      </Suspense>
    </PageMotion>
  );
}




