"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

interface DashboardFiltersProps {
  readonly dateRange?: DateRange;
  readonly onDateRangeChange: (dateRange: DateRange | undefined) => void;
  readonly onReset: () => void;
}

export function DashboardFilters({
  dateRange,
  onDateRangeChange,
  onReset,
}: DashboardFiltersProps) {
  const t = useTranslations("dashboard");
  const hasActiveFilters = dateRange?.from || dateRange?.to;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <DateRangePicker
          dateRange={dateRange}
          onDateChange={onDateRangeChange}
        />
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-9">
            <X className="h-4 w-4 mr-2" />
            {t("filters.reset")}
          </Button>
        )}
      </div>
    </div>
  );
}

