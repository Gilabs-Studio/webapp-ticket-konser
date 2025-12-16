"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTicketCategoriesByEventId } from "../hooks/useTicketCategories";
import { useOrder } from "@/features/orders/hooks/useOrders";
import type { GenerateTicketsRequest } from "../types";
import { Loader2, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

const generateTicketsSchema = z.object({
  items: z
    .array(
      z.object({
        category_id: z.string().uuid("Invalid category"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
      }),
    )
    .min(1, "At least one ticket category is required"),
});

type GenerateTicketsFormData = z.infer<typeof generateTicketsSchema>;

interface GenerateTicketsFormProps {
  readonly orderId: string;
  readonly onSubmit: (request: GenerateTicketsRequest) => void;
  readonly onCancel: () => void;
  readonly isLoading?: boolean;
}

export function GenerateTicketsForm({
  orderId,
  onSubmit,
  onCancel,
  isLoading = false,
}: GenerateTicketsFormProps) {
  const t = useTranslations("tickets");
  const { data: orderData } = useOrder(orderId);
  const order = orderData?.data;
  const eventId = order?.schedule?.event_id;

  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
  } = useTicketCategoriesByEventId(eventId ?? "");

  const categories = categoriesData?.data ?? [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GenerateTicketsFormData>({
    resolver: zodResolver(generateTicketsSchema),
    defaultValues: {
      items: [{ category_id: "", quantity: 1 }],
    },
  });

  const items = watch("items");

  const addItem = () => {
    const currentItems = watch("items");
    setValue("items", [...currentItems, { category_id: "", quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    const currentItems = watch("items");
    setValue(
      "items",
      currentItems.filter((_, i) => i !== index),
    );
  };

  const onFormSubmit = (data: GenerateTicketsFormData) => {
    const request: GenerateTicketsRequest = {
      categories: data.items.map((item) => item.category_id),
      quantities: data.items.map((item) => item.quantity),
    };
    onSubmit(request);
  };

  if (isLoadingCategories) {
    return (
      <div className="py-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          {t("loadingCategories") ?? "Loading ticket categories..."}
        </p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-muted-foreground">
          {t("noCategoriesAvailable") ??
            "No ticket categories available for this event."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        {items.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-4">
                  <div>
                    <Label htmlFor={`category-${index}`}>
                      {t("category") ?? "Category"} {index + 1}
                    </Label>
                    <Select
                      value={item.category_id}
                      onValueChange={(value) => {
                        const currentItems = watch("items");
                        const updated = [...currentItems];
                        updated[index] = { ...updated[index], category_id: value };
                        setValue("items", updated);
                      }}
                    >
                      <SelectTrigger id={`category-${index}`}>
                        <SelectValue
                          placeholder={t("selectCategory") ?? "Select category"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.category_name} -{" "}
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              minimumFractionDigits: 0,
                            }).format(category.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.items?.[index]?.category_id && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.items[index]?.category_id?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`quantity-${index}`}>
                      {t("quantity") ?? "Quantity"}
                    </Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min="1"
                      {...register(`items.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                    />
                    {errors.items?.[index]?.quantity && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.items[index]?.quantity?.message}
                      </p>
                    )}
                  </div>
                </div>

                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length < categories.length && (
        <Button
          type="button"
          variant="outline"
          onClick={addItem}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("addCategory") ?? "Add Category"}
        </Button>
      )}

      {errors.items && (
        <p className="text-sm text-destructive">
          {errors.items.message ?? "Please fix the errors above"}
        </p>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("cancel") ?? "Cancel"}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("generating") ?? "Generating..."}
            </>
          ) : (
            t("generate") ?? "Generate Tickets"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

