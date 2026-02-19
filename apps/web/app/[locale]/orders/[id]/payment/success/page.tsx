import { Suspense } from "react";
import { PageMotion } from "@/components/motion";
import { PaymentSuccessPageClient } from "./payment-success-page-client";
import { Skeleton } from "@/components/ui/skeleton";

interface PaymentSuccessPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function PaymentSuccessPage({
  params,
}: PaymentSuccessPageProps) {
  const { id } = await params;

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
        <PaymentSuccessPageClient orderId={id} />
      </Suspense>
    </PageMotion>
  );
}




