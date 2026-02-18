"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/features/events/services/eventService";
import { usePublicMerchandise, usePublicMerchandiseById } from "@/features/merchandise/hooks/useMerchandise";
import { usePublicEvent } from "@/features/events/hooks/useEvents";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SafeImage } from "@/components/ui/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  ShoppingBag,
  Ticket,
  ArrowRight,
  Package,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { DynamicIcon } from "@/lib/icon-utils";
import type { Event } from "@/features/events/types";
import type { MerchandiseProduct } from "@/features/merchandise/types";

function EventCard({
  event,
  onSelect,
}: {
  readonly event: Event;
  readonly onSelect: (id: string) => void;
}) {
  return (
    <Card
      className="overflow-hidden cursor-pointer group transition-all hover:shadow-lg"
      onClick={() => onSelect(event.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onSelect(event.id);
        }
      }}
    >
      <div className="relative aspect-video w-full bg-muted overflow-hidden">
        {event.bannerImage ? (
          <SafeImage
            src={event.bannerImage}
            alt={event.eventName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            fallbackIcon={true}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Calendar className="h-12 w-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-lg font-bold leading-tight drop-shadow-sm">
            {event.eventName}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-white/80">
            <Calendar className="h-3 w-3" />
            <span>
              {formatDate(event.startDate)} - {formatDate(event.endDate)}
            </span>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {event.description}
          </p>
        )}
        <Button className="w-full gap-2" size="sm">
          <Ticket className="h-4 w-4" />
          Buy Tickets
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );
}

function MerchCard({
  product,
  onSelect,
}: {
  readonly product: MerchandiseProduct;
  readonly onSelect: (id: string) => void;
}) {
  const isOutOfStock = product.stock === 0;

  return (
    <Card
      className="overflow-hidden cursor-pointer group transition-all hover:shadow-lg"
      onClick={() => onSelect(product.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onSelect(product.id);
        }
      }}
    >
      <div className="relative aspect-square w-full bg-muted overflow-hidden">
        {product.imageUrl ? (
          <SafeImage
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            fallbackIcon={true}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <DynamicIcon
              name={product.iconName ?? "Package"}
              className="h-12 w-12 opacity-40"
              size={48}
            />
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-destructive/80 px-3 py-1 rounded-full">
              Sold Out
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
      </div>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold text-base leading-tight line-clamp-1">
          {product.name}
        </h3>
        {product.variant && (
          <p className="text-xs text-muted-foreground">{product.variant}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {product.priceFormatted || formatCurrency(product.price)}
          </span>
          {!isOutOfStock && (
            <span className="text-xs text-muted-foreground">
              {product.stock} left
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EventsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {["event-skeleton-1", "event-skeleton-2", "event-skeleton-3"].map((id) => (
        <div key={id} className="space-y-3">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  );
}

function MerchSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {["merch-skeleton-1", "merch-skeleton-2", "merch-skeleton-3", "merch-skeleton-4"].map((id) => (
        <div key={id} className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function ExplorePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const defaultTab = useMemo(
    () => (tabParam === "merchandise" ? "merchandise" : "tickets"),
    [tabParam],
  );

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedMerchId, setSelectedMerchId] = useState<string | null>(null);

  const { data: eventsData, isLoading: isLoadingEvents } = useQuery({
    queryKey: ["events", "public"],
    queryFn: () => eventService.getPublicEvents({ page: 1, per_page: 100 }),
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: merchData, isLoading: isLoadingMerch } = usePublicMerchandise({
    page: 1,
    per_page: 100,
  });

  const events = eventsData?.data ?? [];
  const products = merchData?.data ?? [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")} aria-label="Back to home">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse events, buy tickets, and shop merchandise
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="tickets" className="gap-2">
            <Ticket className="h-4 w-4" />
            Tickets
          </TabsTrigger>
          <TabsTrigger value="merchandise" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Merchandise
          </TabsTrigger>
        </TabsList>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="mt-6">
          <TicketsTabContent
            events={events}
            isLoading={isLoadingEvents}
            onSelectEvent={setSelectedEventId}
          />
        </TabsContent>

        {/* Merchandise Tab */}
        <TabsContent value="merchandise" className="mt-6">
          <MerchTabContent
            products={products}
            isLoading={isLoadingMerch}
            onSelectProduct={setSelectedMerchId}
          />
        </TabsContent>
      </Tabs>

      {/* Event Detail Dialog */}
      <EventDetailDialog
        eventId={selectedEventId}
        open={!!selectedEventId}
        onOpenChange={(open) => {
          if (!open) setSelectedEventId(null);
        }}
      />

      {/* Merchandise Detail Dialog */}
      <MerchandiseDetailDialog
        merchandiseId={selectedMerchId}
        open={!!selectedMerchId}
        onOpenChange={(open) => {
          if (!open) setSelectedMerchId(null);
        }}
      />
    </div>
  );
}

function TicketsTabContent({
  events,
  isLoading,
  onSelectEvent,
}: {
  readonly events: readonly Event[];
  readonly isLoading: boolean;
  readonly onSelectEvent: (id: string) => void;
}) {
  if (isLoading) {
    return <EventsSkeleton />;
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            No events available at the moment. Check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} onSelect={onSelectEvent} />
      ))}
    </div>
  );
}

function MerchTabContent({
  products,
  isLoading,
  onSelectProduct,
}: {
  readonly products: readonly MerchandiseProduct[];
  readonly isLoading: boolean;
  readonly onSelectProduct: (id: string) => void;
}) {
  if (isLoading) {
    return <MerchSkeleton />;
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            No merchandise available at the moment. Check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <MerchCard key={product.id} product={product} onSelect={onSelectProduct} />
      ))}
    </div>
  );
}

function EventDetailDialog({
  eventId,
  open,
  onOpenChange,
}: {
  readonly eventId: string | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const { data, isLoading } = usePublicEvent(eventId || "", { enabled: !!eventId });
  const event = data?.data;

  if (!eventId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {isLoading && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="sr-only">Loading event...</DialogTitle>
            </DialogHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {!isLoading && !event && (
          <div className="text-center py-8">
            <DialogHeader>
              <DialogTitle className="sr-only">Event not found</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">Event not found</p>
          </div>
        )}

        {!isLoading && event && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">{event.eventName}</DialogTitle>
              <DialogDescription asChild>
                <span className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(event.startDate)} - {formatDate(event.endDate)}
                  </span>
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {event.bannerImage && (
                <div className="relative aspect-video w-full bg-muted rounded-lg overflow-hidden">
                  <SafeImage
                    src={event.bannerImage}
                    alt={event.eventName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 700px"
                    fallbackIcon={true}
                  />
                </div>
              )}

              {event.description && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 gap-2"
                  disabled={isNavigating}
                  onClick={() => {
                    setIsNavigating(true);
                    onOpenChange(false);
                    router.push(`/events/${eventId}/purchase`);
                  }}
                >
                  <Ticket className="h-4 w-4" />
                  Buy Tickets
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function getStockBadgeVariant(
  stockStatus: string,
): "default" | "secondary" | "destructive" {
  if (stockStatus === "healthy") return "default";
  if (stockStatus === "low") return "secondary";
  return "destructive";
}

function getStockLabel(stockStatus: string): string {
  if (stockStatus === "healthy") return "In Stock";
  if (stockStatus === "low") return "Low Stock";
  return "Out of Stock";
}

function MerchandiseDetailDialog({
  merchandiseId,
  open,
  onOpenChange,
}: {
  readonly merchandiseId: string | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = usePublicMerchandiseById(merchandiseId || "");
  const product = data?.data;

  if (!merchandiseId) return null;

  const isOutOfStock = product?.stock === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {isLoading && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="sr-only">Loading merchandise...</DialogTitle>
            </DialogHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {!isLoading && !product && (
          <div className="text-center py-8">
            <DialogHeader>
              <DialogTitle className="sr-only">Merchandise not found</DialogTitle>
            </DialogHeader>
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Merchandise not found</p>
          </div>
        )}

        {!isLoading && product && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">{product.name}</DialogTitle>
              {product.variant && (
                <DialogDescription>Variant: {product.variant}</DialogDescription>
              )}
            </DialogHeader>

            <div className="space-y-4">
              <div className="relative aspect-square w-full bg-muted rounded-lg overflow-hidden">
                {product.imageUrl ? (
                  <SafeImage
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 700px"
                    fallbackIcon={true}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <DynamicIcon
                      name={product.iconName ?? "Package"}
                      className="h-24 w-24 opacity-30"
                      size={96}
                    />
                  </div>
                )}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold text-lg bg-destructive/80 px-4 py-2 rounded-full">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-primary">
                  {product.priceFormatted || formatCurrency(product.price)}
                </div>
                <Badge variant={getStockBadgeVariant(product.stockStatus)}>
                  {getStockLabel(product.stockStatus)}
                </Badge>
              </div>

              {!isOutOfStock && (
                <p className="text-sm text-muted-foreground">
                  {product.stock} items available
                </p>
              )}

              {product.description && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              <Card className="border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <ShoppingBag className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Merchandise can be purchased on-site during the event.
                      Please visit our merchandise booth to complete your purchase.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
