"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";
import { useEventSettings } from "@/features/settings/hooks/useEventSettings";
import { Loader2 } from "lucide-react";

export function QuickActions() {
  const t = useTranslations("dashboard");
  const { data: settings, isLoading } = useEventSettings();
  const { updateSettings, isUpdating } = useEventSettings();

  const handlePauseSalesChange = (checked: boolean) => {
    updateSettings({
      isSalesPaused: checked,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("quickActions.title")}</CardTitle>
          <CardDescription>{t("quickActions.description")}</CardDescription>
        </CardHeader>
        <CardContent className="h-[100px] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

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
          <Switch 
            checked={settings?.isSalesPaused} 
            onCheckedChange={handlePauseSalesChange}
            disabled={isUpdating}
          />
        </div>
      </CardContent>
    </Card>
  );
}

