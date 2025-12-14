"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DangerZone() {
  const t = useTranslations("settings.dangerZone");

  const handleCancelEvent = () => {
    // TODO: Implement cancel event functionality
    console.log("Cancel event clicked");
  };

  return (
    <Card className="border-destructive/20 bg-destructive/5 rounded-xl">
      <CardContent className="p-6">
        <h3 className="text-sm font-medium text-destructive mb-2">
          {t("title")}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {t("description")}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancelEvent}
          size="sm"
          className="border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          {t("cancelEvent")}
        </Button>
      </CardContent>
    </Card>
  );
}
