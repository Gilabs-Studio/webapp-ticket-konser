"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, ExternalLink, ShoppingBag, Coffee, Plus, Shirt } from "lucide-react";
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
      price: "$149",
    },
    {
      id: "ticket-2",
      date: "JUN 24",
      label: "VIP",
      type: "VIP Pass",
      description: "Backstage access, exclusive lounge & merch pack.",
      status: "low_stock",
      price: "$399",
    },
  ];

  const merchandise = [
    { 
      id: "merch-1",
      icon: Shirt, 
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
        <div className="space-y-3">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            {t("storefront.tickets")}
          </div>
          
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="group relative flex flex-col sm:flex-row bg-card/50 border border-border hover:border-ring rounded-xl overflow-hidden transition-all duration-300"
            >
              <div className="w-full sm:w-32 bg-card flex flex-col items-center justify-center p-4 border-b sm:border-b-0 sm:border-r border-border group-hover:border-ring border-dashed">
                <span className="text-xs font-medium text-muted-foreground">{ticket.date}</span>
                <span className="text-xl font-bold text-foreground tracking-tight">
                  {ticket.label || ticket.time}
                </span>
              </div>
              
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-medium text-foreground">{ticket.type}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{ticket.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-base font-medium text-foreground">{ticket.price}</span>
                    <span className="block text-[10px] text-muted-foreground">Inc. VAT</span>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div
                    className={`flex items-center gap-2 text-[10px] ${
                      ticket.status === "available"
                        ? "text-emerald-400"
                        : "text-orange-400"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        ticket.status === "available"
                          ? "bg-emerald-500"
                          : "bg-orange-500"
                      }`}
                    />
                    {ticket.status === "available"
                      ? t("storefront.available")
                      : t("storefront.lowStock")}
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 px-3 py-1.5 bg-background text-foreground text-xs font-medium rounded hover:bg-muted">
                    Select
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4 mt-8">
            {t("storefront.officialMerchandise")}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {merchandise.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="group border border-border bg-card/30 rounded-lg p-3 hover:border-ring transition-all"
                >
                  <div className="aspect-square bg-card rounded border border-border mb-3 flex items-center justify-center relative overflow-hidden">
                    <Icon className="h-8 w-8 text-muted-foreground" />
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                      <button className="bg-background text-foreground p-2 rounded-full hover:scale-105 transition-transform">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-foreground font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.sizes}</div>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">{item.price}</div>
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
