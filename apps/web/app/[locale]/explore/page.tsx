import { Suspense } from "react";
import { PageMotion } from "@/components/motion";
import { ExplorePageClient } from "./explore-page-client";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExplorePage() {
  return (
    <PageMotion className="p-6">
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-96 w-full" />
          </div>
        }
      >
        <ExplorePageClient />
      </Suspense>
    </PageMotion>
  );
}
