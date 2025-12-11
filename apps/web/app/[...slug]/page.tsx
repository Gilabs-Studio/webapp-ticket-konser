"use client";

import { ComingSoon } from "@/components/coming-soon";
import { usePathname } from "next/navigation";

export default function DynamicPage() {
  const pathname = usePathname();
  const pageName = pathname?.split("/").pop() ?? "Page";
  const title = pageName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return <ComingSoon title={title} description={`${title} feature is coming soon.`} />;
}


