import { Suspense } from "react";
import dynamic from "next/dynamic";
import { PageMotion } from "@/components/motion";

const SettingsPage = dynamic(
  () =>
    import("@/features/settings/components/SettingsPage").then((mod) => ({
      default: mod.SettingsPage,
    })),
  {
    loading: () => null, // Use route-level loading.tsx
  },
);

export default function AdminSettingsPage() {
  return (
    <PageMotion className="p-6">
      <Suspense fallback={null}>
        <SettingsPage />
      </Suspense>
    </PageMotion>
  );
}
