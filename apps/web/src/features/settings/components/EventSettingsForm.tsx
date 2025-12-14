"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  eventSettingsSchema,
  type EventSettingsFormData,
} from "../schemas/event-settings.schema";
import { useEventSettings } from "../hooks/useEventSettings";

interface EventSettingsFormProps {
  readonly defaultValues?: Partial<EventSettingsFormData>;
  readonly onCancel?: () => void;
}

export function EventSettingsForm({
  defaultValues,
  onCancel,
}: EventSettingsFormProps) {
  const t = useTranslations("settings");
  const { mutate: saveSettings, isPending } = useEventSettings();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventSettingsFormData>({
    resolver: zodResolver(eventSettingsSchema),
    defaultValues: defaultValues ?? {
      eventName: "",
      date: "",
      capacity: 0,
      urlSlug: "",
    },
  });

  const onSubmit = (data: EventSettingsFormData) => {
    saveSettings(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="border border-border bg-card/20 rounded-xl">
        <CardContent className="space-y-6 p-6">
          <div>
            <h3 className="text-sm font-medium text-foreground mb-1">
              {t("eventDetails.title")}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              {t("eventDetails.description")}
            </p>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="eventName"
                  className="block text-xs font-medium text-muted-foreground mb-1.5"
                >
                  {t("eventDetails.eventName")}
                </label>
                <Input
                  id="eventName"
                  type="text"
                  placeholder="Summer Summit 2024"
                  {...register("eventName")}
                  className={errors.eventName ? "border-destructive" : ""}
                />
                {errors.eventName && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.eventName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="date"
                    className="block text-xs font-medium text-muted-foreground mb-1.5"
                  >
                    {t("eventDetails.date")}
                  </label>
                  <Input
                    id="date"
                    type="date"
                    {...register("date")}
                    className={errors.date ? "border-destructive" : ""}
                  />
                  {errors.date && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.date.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="capacity"
                    className="block text-xs font-medium text-muted-foreground mb-1.5"
                  >
                    {t("eventDetails.capacity")}
                  </label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="2500"
                    {...register("capacity", { valueAsNumber: true })}
                    className={errors.capacity ? "border-destructive" : ""}
                  />
                  {errors.capacity && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.capacity.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="urlSlug"
                  className="block text-xs font-medium text-muted-foreground mb-1.5"
                >
                  {t("eventDetails.urlSlug")}
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-xs">
                    {t("eventDetails.urlPrefix")}
                  </span>
                  <Input
                    id="urlSlug"
                    type="text"
                    placeholder="summer-summit-24"
                    className={cn(
                      "flex-1 rounded-l-none",
                      errors.urlSlug ? "border-destructive" : "",
                    )}
                    {...register("urlSlug")}
                  />
                </div>
                {errors.urlSlug && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.urlSlug.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-4 border-t border-border flex justify-end gap-3 px-6 pb-6">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isPending}
              size="sm"
            >
              {t("actions.cancel")}
            </Button>
          )}
          <Button type="submit" disabled={isPending} size="sm">
            {isPending ? t("actions.saving") : t("actions.saveChanges")}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
