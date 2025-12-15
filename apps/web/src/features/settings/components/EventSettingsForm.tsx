"use client";

import { useEffect } from "react";
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
  const { data, isLoading: isLoadingData, updateSettings, isUpdating } = useEventSettings();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EventSettingsFormData>({
    resolver: zodResolver(eventSettingsSchema),
    defaultValues: defaultValues ?? data ?? {
      eventName: "",
      eventDate: "",
      location: "",
      description: "",
      bannerImage: "",
      contactEmail: "",
      contactPhone: "",
    },
  });

  // Update form when data loads
  useEffect(() => {
    if (data && !isLoadingData) {
      reset(data);
    }
  }, [data, isLoadingData, reset]);

  const onSubmit = (formData: EventSettingsFormData) => {
    updateSettings(formData);
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

              <div>
                <label
                  htmlFor="eventDate"
                  className="block text-xs font-medium text-muted-foreground mb-1.5"
                >
                  {t("eventDetails.date")}
                </label>
                <Input
                  id="eventDate"
                  type="date"
                  {...register("eventDate")}
                  className={errors.eventDate ? "border-destructive" : ""}
                />
                {errors.eventDate && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.eventDate.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-xs font-medium text-muted-foreground mb-1.5"
                >
                  {t("eventDetails.location")}
                </label>
                <Input
                  id="location"
                  type="text"
                  placeholder="Jakarta Convention Center"
                  {...register("location")}
                  className={errors.location ? "border-destructive" : ""}
                />
                {errors.location && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-xs font-medium text-muted-foreground mb-1.5"
                >
                  {t("eventDetails.description")}
                </label>
                <textarea
                  id="description"
                  rows={3}
                  placeholder="Event description"
                  {...register("description")}
                  className={cn(
                    "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    errors.description ? "border-destructive" : "",
                  )}
                />
                {errors.description && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="bannerImage"
                  className="block text-xs font-medium text-muted-foreground mb-1.5"
                >
                  {t("eventDetails.bannerImage")}
                </label>
                <Input
                  id="bannerImage"
                  type="url"
                  placeholder="https://example.com/banner.jpg"
                  {...register("bannerImage")}
                  className={errors.bannerImage ? "border-destructive" : ""}
                />
                {errors.bannerImage && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.bannerImage.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contactEmail"
                    className="block text-xs font-medium text-muted-foreground mb-1.5"
                  >
                    {t("eventDetails.contactEmail")}
                  </label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="info@example.com"
                    {...register("contactEmail")}
                    className={errors.contactEmail ? "border-destructive" : ""}
                  />
                  {errors.contactEmail && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.contactEmail.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contactPhone"
                    className="block text-xs font-medium text-muted-foreground mb-1.5"
                  >
                    {t("eventDetails.contactPhone")}
                  </label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="+62-21-12345678"
                    {...register("contactPhone")}
                    className={errors.contactPhone ? "border-destructive" : ""}
                  />
                  {errors.contactPhone && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.contactPhone.message}
                    </p>
                  )}
                </div>
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
              disabled={isUpdating || isLoadingData}
              size="sm"
            >
              {t("actions.cancel")}
            </Button>
          )}
          <Button type="submit" disabled={isUpdating || isLoadingData} size="sm">
            {isUpdating ? t("actions.saving") : t("actions.saveChanges")}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
