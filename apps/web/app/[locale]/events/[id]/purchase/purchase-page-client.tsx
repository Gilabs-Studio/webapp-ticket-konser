"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { SafeImage } from "@/components/ui/image";
import { ArrowLeft, Loader2, Calendar } from "lucide-react";
import { usePublicEvent } from "@/features/events/hooks/useEvents";
import { scheduleService } from "@/features/schedules/services/scheduleService";
import { useTicketCategoriesByEventIdPublic } from "@/features/events/hooks/useTicketCategories";
import { useCreateOrder } from "@/features/orders/hooks/useOrders";
import { purchaseOrderSchema, type PurchaseOrderFormData } from "@/features/orders/schemas/purchase.schema";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";

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
  // eslint-disable-next-line react-hooks/incompatible-library -- React Hook Form watch() is safe for calculating derived values
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
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/explore")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Explore
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Form Section */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Purchase Tickets</h1>
            <p className="text-muted-foreground mt-2">{event.eventName}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Ticket Selection Section */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Select Ticket Category</h2>
              </div>

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
                <FieldGroup>
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
            </div>

            {selectedCategoryId && (
              <>
                <Separator />

                {/* Buyer Information Section */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Buyer Information</h2>
                  </div>

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
                </div>

                <Separator />

                {/* Submit Section */}
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/explore")}
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
              </>
            )}
          </form>
        </div>

        {/* Right: Sticky Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Event Image */}
            {event.bannerImage && (
              <div className="relative aspect-video w-full bg-muted rounded-lg overflow-hidden">
                <SafeImage
                  src={event.bannerImage}
                  alt={event.eventName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  fallbackIcon={true}
                />
              </div>
            )}

            {/* Event Info */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{event.eventName}</h3>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
                </div>
              </div>

              <Separator />

              {/* Order Summary */}
              {selectedCategoryId && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Order Summary</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ticket Category:</span>
                      <span className="font-medium">{selectedCategory?.category_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium">{selectedCategory && formatCurrency(selectedCategory.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-medium">{quantity}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="font-bold text-2xl text-primary">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

