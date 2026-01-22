"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {

  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { usePublicEvent } from "@/features/events/hooks/useEvents";
import { scheduleService } from "@/features/schedules/services/scheduleService";
import { useTicketCategoriesByEventIdPublic } from "@/features/events/hooks/useTicketCategories";
import { useCreateOrder } from "@/features/orders/hooks/useOrders";
import { purchaseOrderSchema, type PurchaseOrderFormData } from "@/features/orders/schemas/purchase.schema";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface PurchasePageClientProps {
  readonly eventId: string;
}

export function PurchasePageClient({ eventId }: PurchasePageClientProps) {
  const router = useRouter();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Fetch event
  const { data: eventData, isLoading: isLoadingEvent } = usePublicEvent(eventId);
  const event = eventData?.data;

  // Fetch schedules (auto-select first schedule)
  const { data: schedulesData } = useQuery({
    queryKey: ["schedules", "public", "event", eventId],
    queryFn: () => scheduleService.getSchedulesByEventIdPublic(eventId),
    enabled: !!eventId,
  });
  const schedules = schedulesData?.data ?? [];
  const firstSchedule = schedules?.[0];
  const selectedScheduleId = firstSchedule?.id ?? "";

  // Fetch ticket categories
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useTicketCategoriesByEventIdPublic(eventId);
  const categories = categoriesData?.data ?? [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      schedule_id: "",
      ticket_category_id: "",
      quantity: 1,
      buyer_name: "",
      buyer_email: "",
      buyer_phone: "",
    },
  });

  // Auto-set schedule_id when first schedule is available
  useEffect(() => {
    if (selectedScheduleId) {
      setValue("schedule_id", selectedScheduleId);
    }
  }, [selectedScheduleId, setValue]);

  // Get selected category
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  // Calculate total
  const quantity = watch("quantity") ?? 1;
  const totalAmount =
    selectedCategory && quantity > 0
      ? selectedCategory.price * quantity
      : 0;

  const onSubmit = (data: PurchaseOrderFormData) => {
    createOrder(data);
  };

  if (isLoadingEvent || isLoadingCategories) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Event not found</p>
        <Button
          variant="outline"
          onClick={() => router.push("/events")}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push(`/events/${eventId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Purchase Tickets</h1>
        <p className="text-sm text-muted-foreground mt-1">{event.eventName}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Ticket Category</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <FieldLabel>Ticket Category</FieldLabel>
              <Select
                value={selectedCategoryId}
                onValueChange={(value) => {
                  setSelectedCategoryId(value);
                  setValue("ticket_category_id", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a ticket category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((cat) => cat.quota > 0)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.category_name} - {formatCurrency(category.price)} (
                        {category.quota} available)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.ticket_category_id && (
                <FieldError>{errors.ticket_category_id.message}</FieldError>
              )}
            </FieldGroup>

            {selectedCategoryId && (
              <FieldGroup className="mt-4">
                <FieldLabel>Quantity</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  max={Math.min(
                    selectedCategory?.limit_per_user ?? 10,
                    selectedCategory?.quota ?? 10,
                  )}
                  {...register("quantity", { valueAsNumber: true })}
                />
                {errors.quantity && (
                  <FieldError>{errors.quantity.message}</FieldError>
                )}
                {selectedCategory && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Max {selectedCategory.limit_per_user} per person.{" "}
                    {selectedCategory.quota} tickets available.
                  </p>
                )}
              </FieldGroup>
            )}
          </CardContent>
        </Card>

        {selectedCategoryId && (
          <Card>
            <CardHeader>
              <CardTitle>Buyer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldGroup>
                <FieldLabel>Full Name</FieldLabel>
                <Input
                  placeholder="Enter your full name"
                  {...register("buyer_name")}
                />
                {errors.buyer_name && (
                  <FieldError>{errors.buyer_name.message}</FieldError>
                )}
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  {...register("buyer_email")}
                />
                {errors.buyer_email && (
                  <FieldError>{errors.buyer_email.message}</FieldError>
                )}
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Phone Number</FieldLabel>
                <Input
                  type="tel"
                  placeholder="+6281234567890"
                  {...register("buyer_phone")}
                />
                {errors.buyer_phone && (
                  <FieldError>{errors.buyer_phone.message}</FieldError>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  Format: +6281234567890 (E.164)
                </p>
              </FieldGroup>
            </CardContent>
          </Card>
        )}

        {selectedCategoryId && (
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Event:</span>
                <span>{event.eventName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ticket Category:</span>
                <span>{selectedCategory?.category_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span>{quantity}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/events/${eventId}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || !selectedScheduleId || !selectedCategoryId}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Order...
              </>
            ) : (
              "Continue to Payment"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

