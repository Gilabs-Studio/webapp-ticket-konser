"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { PageMotion } from "@/components/motion";

const GateList = dynamic(
  () =>
    import("@/features/gate/components/GateList").then((mod) => ({
      default: mod.GateList,
    })),
  {
    loading: () => null, // Use route-level loading.tsx
  },
);

export default function GatesPage() {
  return (
    <PageMotion className="p-6">
      <Suspense fallback={null}>
        <GateList />
      </Suspense>
    </PageMotion>
  );
}
