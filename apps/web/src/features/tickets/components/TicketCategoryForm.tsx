"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ticketCategorySchema,
  updateTicketCategorySchema,
  type TicketCategoryFormData,
  type UpdateTicketCategoryFormData,
} from "../schemas/ticket-category.schema";
import {
  useCreateTicketCategory,
  useUpdateTicketCategory,
  useTicketCategoriesByEventId,
} from "../hooks/useTicketCategories";
import { Loader2 } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/features/events/services/eventService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TicketCategoryFormProps {
  readonly defaultValues?: Partial<TicketCategoryFormData>;
  readonly ticketCategoryId?: string;
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
  readonly inDialog?: boolean;
}

export function TicketCategoryForm({
  defaultValues,
  ticketCategoryId,
  onCancel,
  onSuccess,
  inDialog = false,
}: TicketCategoryFormProps) {
  const { mutate: createTicketCategory, isPending: isCreating } =
    useCreateTicketCategory();
  const { mutate: updateTicketCategory, isPending: isUpdating } =
    useUpdateTicketCategory();

  const isPending = isCreating || isUpdating;
  const isEditMode = !!ticketCategoryId;
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);

  const schema = isEditMode
    ? updateTicketCategorySchema
    : ticketCategorySchema;

  const form = useForm<TicketCategoryFormData | UpdateTicketCategoryFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      event_id: "",
      category_name: "",
      price: 0,
      quota: 0,
      limit_per_user: 1,
    },
    mode: "onChange", // Validate on change for better UX
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = form;

  // Use useWatch to avoid memoization issues - must be declared before using it
  const eventId = useWatch({
    control: control,
    name: "event_id" as keyof TicketCategoryFormData,
  }) as string | undefined;

  // Get events for event selection
  const { data: eventsData } = useQuery({
    queryKey: ["events", "admin"],
    queryFn: () => eventService.getEvents({ page: 1, per_page: 100 }),
    staleTime: 30000,
  });

  const events = eventsData?.data ?? [];

  // Get ticket categories for the selected event
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useTicketCategoriesByEventId(eventId ?? "");

  const categories = categoriesData?.data ?? [];

  // Reset creating new category state when event changes
  useEffect(() => {
    setIsCreatingNewCategory(false);
    setValue("category_name", "");
  }, [eventId, setValue]);

  // Helper function to validate and convert numeric field
  const validateNumericField = (
    value: unknown,
    fieldName: string,
    min: number = 0,
  ): number | null => {
    if (value === undefined || value === null) {
      return null;
    }
    let num: number;
    if (typeof value === "string") {
      num = Number.parseFloat(value);
    } else if (typeof value === "number") {
      num = value;
    } else {
      console.error(`Invalid ${fieldName} value type:`, value);
      return null;
    }
    if (Number.isNaN(num) || num < min) {
      console.error(`Invalid ${fieldName} value:`, value);
      return null;
    }
    return num;
  };

  // Helper function to validate create data
  const validateCreateData = (
    data: TicketCategoryFormData | UpdateTicketCategoryFormData,
  ): data is TicketCategoryFormData => {
    const createData = data as TicketCategoryFormData;
    if (!createData.event_id?.trim()) {
      console.error("Event ID is required");
      return false;
    }
    if (!createData.category_name?.trim()) {
      console.error("Category name is required");
      return false;
    }
    return true;
  };

  const onSubmit = (data: TicketCategoryFormData | UpdateTicketCategoryFormData) => {
    const submitData: TicketCategoryFormData | UpdateTicketCategoryFormData = {
      ...data,
    };

    // Convert and validate numeric fields
    const price = validateNumericField(submitData.price, "price");
    if (price !== null && "price" in submitData) {
      submitData.price = price;
    }

    const quota = validateNumericField(submitData.quota, "quota");
    if (quota !== null && "quota" in submitData) {
      submitData.quota = quota;
    }

    const limitPerUser = validateNumericField(
      submitData.limit_per_user,
      "limit_per_user",
      1,
    );
    if (limitPerUser !== null && "limit_per_user" in submitData) {
      submitData.limit_per_user = limitPerUser;
    }

    // Validate required fields for create mode
    if (!isEditMode && !validateCreateData(submitData)) {
      return;
    }

    console.log("Submitting ticket category data:", submitData);

    if (isEditMode && ticketCategoryId) {
      updateTicketCategory(
        {
          id: ticketCategoryId,
          data: submitData as UpdateTicketCategoryFormData,
        },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        },
      );
    } else {
      createTicketCategory(submitData as TicketCategoryFormData, {
        onSuccess: () => {
          onSuccess?.();
        },
      });
    }
  };

  const formFields = (
    <div className="space-y-6">
      {!isEditMode && (
        <div>
          <Label htmlFor="event_id" className="text-sm">
            Event <span className="text-destructive">*</span>
          </Label>
          <Select
            value={eventId ?? ""}
            onValueChange={(value) =>
              setValue("event_id" as keyof TicketCategoryFormData, value)
            }
            disabled={isPending}
          >
            <SelectTrigger
              className={
                "event_id" in errors && errors.event_id
                  ? "border-destructive"
                  : ""
              }
            >
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.eventName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {"event_id" in errors && errors.event_id && (
            <p className="text-xs text-destructive mt-1">
              {errors.event_id.message}
            </p>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="category_name" className="text-sm">
          Category Name <span className="text-destructive">*</span>
        </Label>
        {!isEditMode && eventId && categories.length > 0 && !isCreatingNewCategory ? (
          <Select
            value={watch("category_name") ?? ""}
            onValueChange={(value) => {
              if (value === "__new__") {
                setIsCreatingNewCategory(true);
                setValue("category_name", "");
              } else {
                setValue("category_name", value);
                // Auto-fill price, quota, and limit_per_user if category is selected
                const selectedCategory = categories.find(
                  (cat) => cat.category_name === value,
                );
                if (selectedCategory) {
                  setValue("price", selectedCategory.price);
                  setValue("quota", selectedCategory.quota);
                  setValue("limit_per_user", selectedCategory.limit_per_user);
                }
              }
            }}
            disabled={isPending || isLoadingCategories}
          >
            <SelectTrigger
              className={
                errors.category_name ? "border-destructive" : ""
              }
            >
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__new__">
                + Create New Category
              </SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.category_name}>
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
        ) : (
          <Input
            id="category_name"
            type="text"
            placeholder="VIP Pass"
            {...register("category_name")}
            className={errors.category_name ? "border-destructive" : ""}
            disabled={isPending}
          />
        )}
        {errors.category_name && (
          <p className="text-xs text-destructive mt-1">
            {errors.category_name.message}
          </p>
        )}
        {!isEditMode && eventId && categories.length > 0 && !isCreatingNewCategory && (
          <p className="text-xs text-muted-foreground mt-1">
            Select an existing category to reuse its settings, or choose "Create New Category" to enter a new name
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price" className="text-sm">
            Price <span className="text-destructive">*</span>
          </Label>
          <Input
            id="price"
            type="number"
            placeholder="300000"
            step="1000"
            {...register("price", { 
              valueAsNumber: true,
              validate: (value) => {
                if (value === undefined || value === null) {
                  return "Price is required";
                }
                if (Number.isNaN(value) || value < 0) {
                  return "Price must be a valid number greater than or equal to 0";
                }
                return true;
              }
            })}
            className={errors.price ? "border-destructive" : ""}
            disabled={isPending}
            min={0}
          />
          {errors.price && (
            <p className="text-xs text-destructive mt-1">
              {errors.price.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="quota" className="text-sm">
            Quota <span className="text-destructive">*</span>
          </Label>
          <Input
            id="quota"
            type="number"
            placeholder="200"
            {...register("quota", { 
              valueAsNumber: true,
              validate: (value) => {
                if (value === undefined || value === null) {
                  return "Quota is required";
                }
                if (Number.isNaN(value) || value < 0) {
                  return "Quota must be a valid number greater than or equal to 0";
                }
                return true;
              }
            })}
            className={errors.quota ? "border-destructive" : ""}
            disabled={isPending}
            min={0}
          />
          {errors.quota && (
            <p className="text-xs text-destructive mt-1">
              {errors.quota.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="limit_per_user" className="text-sm">
          Limit Per User <span className="text-destructive">*</span>
        </Label>
        <Input
          id="limit_per_user"
          type="number"
          placeholder="3"
          {...register("limit_per_user", { 
            valueAsNumber: true,
            validate: (value) => {
              if (value === undefined || value === null) {
                return "Limit per user is required";
              }
              if (Number.isNaN(value) || value < 1) {
                return "Limit per user must be at least 1";
              }
              return true;
            }
          })}
          className={errors.limit_per_user ? "border-destructive" : ""}
          disabled={isPending}
          min={1}
        />
        {errors.limit_per_user && (
          <p className="text-xs text-destructive mt-1">
            {errors.limit_per_user.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Maximum number of tickets a user can purchase for this category
        </p>
      </div>
    </div>
  );

  if (inDialog) {
    return (
      <>
        <form onSubmit={handleSubmit(onSubmit)} id="ticket-category-form">
          {formFields}
        </form>
        <DialogFooter>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            form="ticket-category-form"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Update Category" : "Create Category"}
          </Button>
        </DialogFooter>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="border border-border bg-card/20 rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {isEditMode ? "Edit Ticket Category" : "Create New Ticket Category"}
          </h3>
        </div>
        {formFields}
        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Update Category" : "Create Category"}
          </Button>
        </div>
      </div>
    </form>
  );
}
