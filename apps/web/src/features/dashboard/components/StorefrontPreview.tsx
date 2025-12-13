"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, ExternalLink, Package, ShoppingBag, Coffee, Ticket } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function StorefrontPreview() {
  const t = useTranslations("dashboard");

  // Mock ticket data - will be replaced with actual API data
  const tickets = [
    {
      id: "ticket-1",
      date: "JUN 24",
      time: "14:00",
      type: "General Admission",
      description: "Access to main stage and exhibition hall.",
      status: "available",
      price: "$149 Inc. VAT",
    },
    {
      id: "ticket-2",
      date: "JUN 24",
      label: "VIP",
      type: "VIP Pass",
      description: "Backstage access, exclusive lounge & merch pack.",
      status: "low_stock",
      price: "$399 Inc. VAT",
    },
  ];

  const merchandise = [
    { 
      id: "merch-1",
      icon: Package, 
      label: "Event Hoodie",
      sizes: "S, M, L, XL",
      price: "$55"
    },
    { 
      id: "merch-2",
      icon: ShoppingBag, 
      label: "Tote Bag",
      sizes: "Canvas",
      price: "$25"
    },
    { 
      id: "merch-3",
      icon: Coffee, 
      label: "Tumbler",
      sizes: "Matte Black",
      price: "$30"
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("storefront.title")}</CardTitle>
            <CardDescription>{t("storefront.description")}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              {t("storefront.editProducts")}
            </Button>
            <Button variant="default" size="sm" asChild>
              <Link href="/">
                <ExternalLink className="mr-2 h-4 w-4" />
                {t("storefront.visitLivePage")}
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold uppercase mb-3">
            {t("storefront.tickets")}
          </h3>
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card"
              >
                {/* Image Placeholder for Ticket */}
                <div className="shrink-0 w-20 h-20 rounded-lg bg-muted flex items-center justify-center border">
                  <Ticket className="h-8 w-8 text-muted-foreground" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {ticket.date}
                    </span>
                    {ticket.time && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {ticket.time}
                        </span>
                      </>
                    )}
                    {ticket.label && (
                      <Badge variant="outline" className="text-xs">
                        {ticket.label}
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-semibold mb-1">{ticket.type}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {ticket.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        ticket.status === "available"
                          ? "bg-green-500"
                          : "bg-orange-500"
                      }`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {ticket.status === "available"
                        ? t("storefront.available")
                        : t("storefront.lowStock")}
                    </span>
                  </div>
                </div>
                <div className="ml-4 text-right shrink-0">
                  <p className="font-semibold">{ticket.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase mb-3">
            {t("storefront.officialMerchandise")}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {merchandise.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex flex-col rounded-lg border bg-card overflow-hidden"
                >
                  {/* Image Placeholder */}
                  <div className="w-full aspect-square bg-muted flex items-center justify-center border-b">
                    <Icon className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="p-3 space-y-1">
                    <h4 className="font-semibold text-sm">{item.label}</h4>
                    <p className="text-xs text-muted-foreground">{item.sizes}</p>
                    <p className="font-semibold text-sm">{item.price}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
