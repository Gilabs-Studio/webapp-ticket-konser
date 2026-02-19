"use client";

import dynamic from "next/dynamic";
import { useOrder } from "@/features/orders/hooks/useOrders";

const OrderDetail = dynamic(
  () =>
    import("@/features/orders/components/OrderDetail").then((mod) => ({
      default: mod.OrderDetail,
    })),
  {
    loading: () => null, // Use route-level loading.tsx
  },
);

interface OrderDetailPageClientProps {
  readonly orderId: string;
}

export function OrderDetailPageClient({
  orderId,
}: OrderDetailPageClientProps) {
  const { data, isLoading } = useOrder(orderId);

  const order = data?.data;

  return <OrderDetail order={order} isLoading={isLoading} />;
}




