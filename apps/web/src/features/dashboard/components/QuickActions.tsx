"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function QuickActions() {
  const t = useTranslations("dashboard");
  const [pauseSales, setPauseSales] = useState(false);
  const [discountMode, setDiscountMode] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("quickActions.title")}</CardTitle>
        <CardDescription>{t("quickActions.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              {t("quickActions.pauseTicketSales")}
            </label>
            <p className="text-xs text-muted-foreground">
              {t("quickActions.pauseTicketSalesDesc")}
            </p>
          </div>
          <Switch checked={pauseSales} onCheckedChange={setPauseSales} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              {t("quickActions.discountMode")}
            </label>
            <p className="text-xs text-muted-foreground">
              {t("quickActions.discountModeDesc")}
            </p>
          </div>
          <Switch checked={discountMode} onCheckedChange={setDiscountMode} />
        </div>
        <Button className="w-full" variant="outline">
          <Download className="mr-2 h-4 w-4" />
          {t("quickActions.exportReport")}
        </Button>
      </CardContent>
    </Card>
  );
}
