"use client";

import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { merchandiseService } from "@/features/merchandise/services/merchandiseService";

const MerchandiseManagement = dynamic(
  () =>
    import("@/features/merchandise/components/MerchandiseManagement").then(
      (mod) => ({ default: mod.MerchandiseManagement }),
    ),
  {
    loading: () => null, // Use route-level loading.tsx
  },
);

export function MerchandisePageClient() {
  const { data, isLoading } = useQuery({
    queryKey: ["merchandise"],
    queryFn: () => merchandiseService.getMerchandise({ page: 1, per_page: 100 }),
    staleTime: 0, // Always refetch when invalidated
    refetchOnMount: true,
  });

  const products = data?.data ?? [];

  const handleExportCSV = () => {
    // TODO: Implement CSV export functionality
    console.log("Export CSV clicked");
  };

  return (
    <MerchandiseManagement
      products={products}
      isLoading={isLoading}
      onExportCSV={handleExportCSV}
    />
  );
}
