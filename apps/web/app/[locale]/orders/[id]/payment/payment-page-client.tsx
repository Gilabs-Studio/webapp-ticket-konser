"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Clock, Copy, Check } from "lucide-react";
import { useMyOrder, useInitiatePayment, usePaymentStatus } from "@/features/orders/hooks/useOrders";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

interface PaymentPageClientProps {
  readonly orderId: string;
}

export function PaymentPageClient({ orderId }: PaymentPageClientProps) {
  const router = useRouter();
  const { mutate: initiatePayment, isPending: isInitiating } = useInitiatePayment();
  const { data: orderData, isLoading: isLoadingOrder } = useMyOrder(orderId);
  const { data: paymentStatusData } = usePaymentStatus(orderId, true);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [qrisCode, setQrisCode] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);

  const order = orderData?.data;
  const paymentStatus = paymentStatusData?.data;

  // Get QRIS code from order or payment status if available
  useEffect(() => {
    // Prefer QRIS code from order (stored in DB), fallback to payment status
    const qrisCodeFromOrder = order?.qris_code;
    const qrisCodeFromStatus = paymentStatus?.qris_code;
    const availableQrisCode = qrisCodeFromOrder || qrisCodeFromStatus;
    
    if (availableQrisCode && !qrisCode && !paymentStatus?.is_expired) {
      setQrisCode(availableQrisCode);
      setPaymentInitiated(true);
      if (paymentStatus?.expires_at) {
        setExpiresAt(new Date(paymentStatus.expires_at));
      } else if (order?.payment_expires_at) {
        setExpiresAt(new Date(order.payment_expires_at));
      }
    }
  }, [order?.qris_code, order?.payment_expires_at, paymentStatus?.qris_code, paymentStatus?.expires_at, paymentStatus?.is_expired, qrisCode]);

  // Initiate payment on mount if not already initiated
  useEffect(() => {
    // Don't initiate if:
    // 1. Order is not loaded yet
    // 2. Payment status is not UNPAID
    // 3. Payment already initiated (has QRIS code or transaction ID)
    // 4. Currently initiating payment
    // 5. Order already has transaction ID (payment already initiated - wait for payment status)
    if (
      !order ||
      order.payment_status !== "UNPAID" ||
      paymentInitiated ||
      isInitiating ||
      qrisCode ||
      order.midtrans_transaction_id // Payment already initiated, wait for payment status to load QRIS code
    ) {
      return;
    }

      initiatePayment(
        {
          orderId: order.id,
          data: { payment_method: "qris" },
        },
        {
          onSuccess: (response) => {
            setPaymentInitiated(true);
            setQrisCode(response.data.qris_code);
            if (response.data.expires_at) {
              setExpiresAt(new Date(response.data.expires_at));
            }
          },
          onError: (error: unknown) => {
            const err = error as { response?: { data?: { error?: { message?: string; code?: string } } } };
            const errorCode = err.response?.data?.error?.code;
            const errorMessage = err.response?.data?.error?.message;
            
            // If payment already initiated, set paymentInitiated to true
            if (errorMessage?.toLowerCase().includes("payment already initiated") || 
                errorCode === "PAYMENT_ALREADY_PROCESSED") {
              setPaymentInitiated(true);
            }
          },
        },
      );
  }, [order, paymentInitiated, isInitiating, initiatePayment, qrisCode]);

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
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push(`/orders/${orderId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Payment</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Order Code: {order.order_code}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Amount:</span>
            <span className="font-semibold">
              {formatCurrency(order.total_amount)}
            </span>
          </div>
        </CardContent>
      </Card>

      {isInitiating ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Initializing payment...</p>
          </CardContent>
        </Card>
      ) : qrisCode ? (
        <Card>
          <CardHeader>
            <CardTitle>Scan QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center p-4 bg-white rounded-md">
              <QRCodeSVG value={qrisCode} size={256} level="M" />
            </div>
            {expiresAt && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Payment expires in:{" "}
                  <span className="font-semibold text-destructive">
                    {timeLeft}
                  </span>
                </p>
              </div>
            )}
            <p className="text-sm text-center text-muted-foreground">
              Scan this QR code with your mobile payment app (GoPay, OVO, DANA,
              etc.)
            </p>
            <div className="flex items-center justify-center gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyImageUrl}
                className="gap-2"
              >
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
          </CardContent>
        </Card>
      ) : paymentInitiated && order?.midtrans_transaction_id && !qrisCode ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-8 w-8 mx-auto mb-4 text-yellow-500" />
            <p className="text-muted-foreground mb-2">
              Payment has already been initiated for this order.
            </p>
            {paymentStatus?.is_expired ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Payment has expired. Please initiate a new payment.
                </p>
                <Button
                  onClick={() => {
                    setPaymentInitiated(false);
                    setQrisCode("");
                    setExpiresAt(null);
                    initiatePayment({
                      orderId: order.id,
                      data: { payment_method: "qris" },
                    });
                  }}
                >
                  Initiate New Payment
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Loading QR code...
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Refresh payment status to get QRIS code
                    window.location.reload();
                  }}
                >
                  Refresh Payment Status
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <p className="text-muted-foreground">
              Failed to initialize payment. Please try again.
            </p>
            <Button
              className="mt-4"
              onClick={() => {
                setPaymentInitiated(false);
                initiatePayment({
                  orderId: order.id,
                  data: { payment_method: "qris" },
                });
              }}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {paymentStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {paymentStatus.payment_status === "UNPAID" && (
                <>
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span>Waiting for payment</span>
                </>
              )}
              {paymentStatus.payment_status === "PAID" && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Payment successful</span>
                </>
              )}
              {(paymentStatus.payment_status === "CANCELED" ||
                paymentStatus.payment_status === "FAILED") && (
                <>
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span>Payment {paymentStatus.payment_status.toLowerCase()}</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

