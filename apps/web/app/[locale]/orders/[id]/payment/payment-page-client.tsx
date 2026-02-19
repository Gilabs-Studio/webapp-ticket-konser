"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Clock, Copy, Check } from "lucide-react";
import { useMyOrder, useInitiatePayment, usePaymentStatus } from "@/features/orders/hooks/useOrders";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

interface PaymentPageClientProps {
  readonly orderId: string;
}

interface QrisContentProps {
  readonly isInitiating: boolean;
  readonly qrisCode: string;
  readonly paymentInitiated: boolean;
  readonly midtransTransactionId?: string;
  readonly isExpired?: boolean;
  readonly timeLeft: string;
  readonly expiresAt: Date | null;
  readonly copied: boolean;
  readonly onCopy: () => void;
  readonly onInitiateNew: () => void;
  readonly onRetry: () => void;
}

function QrisContent({
  isInitiating,
  qrisCode,
  paymentInitiated,
  midtransTransactionId,
  isExpired,
  timeLeft,
  expiresAt,
  copied,
  onCopy,
  onInitiateNew,
  onRetry,
}: QrisContentProps) {
  if (isInitiating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Initializing payment...</p>
      </div>
    );
  }

  if (qrisCode) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="p-6 bg-white rounded-2xl shadow-sm border">
            <QRCodeSVG value={qrisCode} size={256} level="M" />
          </div>
        </div>

        {expiresAt && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Payment expires in:{" "}
              <span className="font-semibold text-destructive">{timeLeft}</span>
            </p>
          </div>
        )}

        <p className="text-sm text-center text-muted-foreground">
          Scan this QR code with GoPay, OVO, DANA, or any QRIS-compatible app
        </p>

        <div className="flex justify-center pt-2">
          <Button variant="outline" size="sm" onClick={onCopy} className="gap-2">
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy QRIS Image URL
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (paymentInitiated && midtransTransactionId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Clock className="h-10 w-10 text-yellow-500" />
        <p className="text-muted-foreground text-center">
          Payment has already been initiated for this order.
        </p>
        {isExpired ? (
          <>
            <p className="text-sm text-muted-foreground">
              Payment has expired. Please initiate a new payment.
            </p>
            <Button onClick={onInitiateNew}>Initiate New Payment</Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Loading QR code...</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <XCircle className="h-10 w-10 text-destructive" />
      <p className="text-muted-foreground">Failed to initialize payment.</p>
      <Button onClick={onRetry}>Retry</Button>
    </div>
  );
}



export function PaymentPageClient({ orderId }: PaymentPageClientProps) {
  const router = useRouter();
  const { mutate: initiatePayment, isPending: isInitiating } = useInitiatePayment();
  const { data: orderData, isLoading: isLoadingOrder } = useMyOrder(orderId);
  const { data: paymentStatusData } = usePaymentStatus(orderId, true);
  const [copied, setCopied] = useState(false);

  // Fresh QRIS code and expiry received directly from the initiatePayment mutation response,
  // before order/paymentStatus queries have re-fetched. Set only in mutation callbacks.
  const [mutationQrisCode, setMutationQrisCode] = useState<string>("");
  const [mutationExpiresAt, setMutationExpiresAt] = useState<Date | null>(null);
  // Tracks whether an initiation request has been submitted this session.
  const [initiationSubmitted, setInitiationSubmitted] = useState(false);

  const order = orderData?.data;
  const paymentStatus = paymentStatusData?.data;

  // Derive QRIS code from all sources — avoids setState-in-effect by computing here.
  // Priority: fresh mutation result → stored on order → stored in payment status.
  const qrisCode = useMemo(() => {
    if (mutationQrisCode) return mutationQrisCode;
    if (paymentStatus?.is_expired) return "";
    return order?.qris_code || paymentStatus?.qris_code || "";
  }, [mutationQrisCode, order?.qris_code, paymentStatus?.qris_code, paymentStatus?.is_expired]);

  // Derive expiry date from all sources without setState-in-effect.
  const expiresAt = useMemo<Date | null>(() => {
    if (mutationExpiresAt) return mutationExpiresAt;
    if (paymentStatus?.expires_at) return new Date(paymentStatus.expires_at);
    if (order?.payment_expires_at) return new Date(order.payment_expires_at);
    return null;
  }, [mutationExpiresAt, paymentStatus?.expires_at, order?.payment_expires_at]);

  // Derive paymentInitiated from server data — no state sync needed.
  const paymentInitiated =
    initiationSubmitted ||
    !!mutationQrisCode ||
    !!order?.midtrans_transaction_id ||
    !!order?.qris_code ||
    !!paymentStatus?.qris_code;

  // Initiate payment when the order is loaded and no prior initiation exists.
  useEffect(() => {
    if (
      !order ||
      order.payment_status !== "UNPAID" ||
      paymentInitiated ||
      isInitiating ||
      order.midtrans_transaction_id // Payment already exists — wait for status to load QRIS.
    ) {
      return;
    }

    setInitiationSubmitted(true);
    initiatePayment(
      { orderId: order.id, data: { payment_method: "qris" } },
      {
        onSuccess: (response) => {
          setMutationQrisCode(response.data.qris_code);
          if (response.data.expires_at) {
            setMutationExpiresAt(new Date(response.data.expires_at));
          }
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { error?: { message?: string; code?: string } } } };
          const errorCode = err.response?.data?.error?.code;
          const errorMessage = err.response?.data?.error?.message;

          // Already initiated server-side — paymentInitiated will become true via
          // order.midtrans_transaction_id once the order query re-fetches.
          if (
            errorMessage?.toLowerCase().includes("payment already initiated") ||
            errorCode === "PAYMENT_ALREADY_PROCESSED"
          ) {
            return;
          }
          // Reset so the user can retry.
          setInitiationSubmitted(false);
        },
      },
    );
  }, [order, paymentInitiated, isInitiating, initiatePayment]);

  // Redirect on payment success
  useEffect(() => {
    if (paymentStatus?.payment_status === "PAID") {
      router.push(`/orders/${orderId}/payment/success`);
    } else if (
      paymentStatus?.payment_status === "CANCELED" ||
      paymentStatus?.payment_status === "FAILED"
    ) {
      router.push(`/orders/${orderId}/payment/failure`);
    }
  }, [paymentStatus?.payment_status, orderId, router]);

  // Calculate countdown
  const [timeLeft, setTimeLeft] = useState<string>("");
  useEffect(() => {
    if (!expiresAt) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // Generate QRIS image URL
  const qrisImageUrl = qrisCode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(qrisCode)}`
    : "";

  // Copy QRIS image URL to clipboard
  const handleCopyImageUrl = async () => {
    if (!qrisImageUrl) return;

    try {
      await navigator.clipboard.writeText(qrisImageUrl);
      setCopied(true);
      toast.success("QRIS Image URL copied to clipboard", {
        description: "You can now paste the URL anywhere you need it.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy URL", {
        description: "Please try again or copy manually.",
      });
    }
  };

  // Reset mutation state and re-initiate a fresh QRIS payment (used after expiry or on retry).
  const handleInitiateNew = () => {
    if (!order) return;
    setMutationQrisCode("");
    setMutationExpiresAt(null);
    setInitiationSubmitted(false);
    initiatePayment(
      { orderId: order.id, data: { payment_method: "qris" } },
      {
        onSuccess: (response) => {
          setMutationQrisCode(response.data.qris_code);
          if (response.data.expires_at) {
            setMutationExpiresAt(new Date(response.data.expires_at));
          }
        },
      },
    );
  };

  // Re-initiate after a failed attempt.
  const handleRetry = () => {
    if (!order) return;
    setInitiationSubmitted(false);
    initiatePayment(
      { orderId: order.id, data: { payment_method: "qris" } },
      {
        onSuccess: (response) => {
          setMutationQrisCode(response.data.qris_code);
          if (response.data.expires_at) {
            setMutationExpiresAt(new Date(response.data.expires_at));
          }
        },
      },
    );
  };

  if (isLoadingOrder) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Order not found</p>
        <Button
          variant="outline"
          onClick={() => router.push("/orders")}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

  if (order.payment_status !== "UNPAID") {
    // Redirect based on status
    if (order.payment_status === "PAID") {
      router.push(`/orders/${orderId}/payment/success`);
      return null;
    }
    router.push(`/orders/${orderId}/payment/failure`);
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push(`/orders/${orderId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Order
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: QRIS Payment Section */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Payment</h1>
            <p className="text-muted-foreground mt-2">Order Code: {order.order_code}</p>
          </div>

          <Separator />

          {/* QRIS Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Scan QR Code to Pay</h2>

            <QrisContent
              isInitiating={isInitiating}
              qrisCode={qrisCode}
              paymentInitiated={paymentInitiated}
              midtransTransactionId={order.midtrans_transaction_id}
              isExpired={paymentStatus?.is_expired}
              timeLeft={timeLeft}
              expiresAt={expiresAt}
              copied={copied}
              onCopy={handleCopyImageUrl}
              onInitiateNew={handleInitiateNew}
              onRetry={handleRetry}
            />
          </div>

          <Separator />

          {/* Payment Status */}
          {paymentStatus && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Payment Status</h2>
              <div className="flex items-center gap-2">
                {paymentStatus.payment_status === "UNPAID" && (
                  <>
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <span className="text-muted-foreground">Waiting for payment...</span>
                  </>
                )}
                {paymentStatus.payment_status === "PAID" && (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-600">Payment successful</span>
                  </>
                )}
                {(paymentStatus.payment_status === "CANCELED" ||
                  paymentStatus.payment_status === "FAILED") && (
                  <>
                    <XCircle className="h-5 w-5 text-destructive" />
                    <span className="font-medium text-destructive">
                      Payment {paymentStatus.payment_status.toLowerCase()}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Sticky Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            <h3 className="font-semibold text-lg">Order Summary</h3>

            <Separator />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Code</span>
                <span className="font-medium font-mono">{order.order_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Buyer</span>
                <span className="font-medium">{order.buyer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{order.buyer_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">
                  {order.quantity} ticket{order.quantity > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">QRIS</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-2xl text-primary">
                {formatCurrency(order.total_amount)}
              </span>
            </div>

            {expiresAt && (
              <>
                <Separator />
                <div className="text-sm text-muted-foreground">
                  <p>Payment deadline:</p>
                  <p className="font-medium text-foreground mt-1">
                    {expiresAt.toLocaleString("id-ID")}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}