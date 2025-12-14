import { Suspense } from "react";
import dynamic from "next/dynamic";
import { PageMotion } from "@/components/motion";

const AttendeeList = dynamic(
  () =>
    import("@/features/attendance/components/AttendeeList").then((mod) => ({
      default: mod.AttendeeList,
    })),
  {
    loading: () => null, // Use route-level loading.tsx
  },
);

export default function AttendeesPage() {
  return (
    <PageMotion className="p-6">
      <Suspense fallback={null}>
        <AttendeeList />
      </Suspense>
    </PageMotion>
  );
}
