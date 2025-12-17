"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  createEventSchema,
  updateEventSchema,
  type CreateEventFormData,
  type UpdateEventFormData,
} from "../schemas/event.schema";
import {
  useCreateEvent,
  useUpdateEvent,
} from "../hooks/useEvents";
import { EventFormFields } from "./EventFormFields";
import { EventBannerUpload } from "./EventBannerUpload";
import { Button } from "@/components/ui/button";
import type { Event } from "../types";

interface EventFormProps {
  readonly defaultValues?: Partial<CreateEventFormData>;
  readonly eventId?: string;
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
  readonly inDialog?: boolean;
}

export function EventForm({
  defaultValues,
  eventId,
  onCancel,
  onSuccess,
  inDialog = false,
}: EventFormProps) {
  const isEditMode = !!eventId;
  const { mutate: createEvent, isPending: isCreating } = useCreateEvent();
  const { mutate: updateEvent, isPending: isUpdating } = useUpdateEvent();

  const isPending = isCreating || isUpdating;

  // Helper function to convert date string to YYYY-MM-DD format for input type="date"
  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return "";
      // Format to YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  // Prepare default values with proper date formatting - memoized to prevent infinite loops
  const preparedDefaultValues = useMemo(() => {
    if (!defaultValues) return undefined;
    return {
      ...defaultValues,
      startDate: defaultValues.startDate
        ? formatDateForInput(defaultValues.startDate)
        : "",
      endDate: defaultValues.endDate
        ? formatDateForInput(defaultValues.endDate)
        : "",
    };
  }, [
    defaultValues?.eventName,
    defaultValues?.description,
    defaultValues?.bannerImage,
    defaultValues?.status,
    defaultValues?.startDate,
    defaultValues?.endDate,
  ]);

  const form = useForm<CreateEventFormData | UpdateEventFormData>({
    resolver: zodResolver(isEditMode ? updateEventSchema : createEventSchema),
    defaultValues: preparedDefaultValues ?? {
      eventName: "",
      description: "",
      bannerImage: "",
      status: "draft",
      startDate: "",
      endDate: "",
    },
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = form;

  const [imagePreview, setImagePreview] = useState<string | null>(
    defaultValues?.bannerImage ?? null,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>(
    defaultValues?.status ?? "draft",
  );

  // Track which eventId we've already reset the form for
  const resetForEventIdRef = useRef<string | undefined>();

  // Update form only once when defaultValues becomes available for a new eventId
  useEffect(() => {
    // Only reset if:
    // 1. We have preparedDefaultValues
    // 2. We have an eventId (edit mode)
    // 3. We haven't reset for this eventId yet
    if (
      preparedDefaultValues &&
      eventId &&
      resetForEventIdRef.current !== eventId
    ) {
      // Reset form with new default values
      reset(preparedDefaultValues);
      // Update local state
      setImagePreview(preparedDefaultValues.bannerImage ?? null);
      setStatus(preparedDefaultValues.status ?? "draft");
      setImageFile(null); // Clear any previously selected file

      // Mark that we've reset for this eventId
      resetForEventIdRef.current = eventId;
    }
    // When eventId changes, allow reset again for new eventId
    if (!eventId) {
      resetForEventIdRef.current = undefined;
    }
  }, [eventId, reset, preparedDefaultValues?.eventName, preparedDefaultValues?.startDate, preparedDefaultValues?.endDate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setValue("bannerImage", "", { shouldValidate: true });
      return;
    }

    if (file.size > maxSize) {
      setValue("bannerImage", "", { shouldValidate: true });
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setValue("bannerImage", "", { shouldValidate: false });
  };

  const onSubmit = (data: CreateEventFormData | UpdateEventFormData) => {
    if (isEditMode && eventId) {
      updateEvent(
        {
          id: eventId,
          data: data as UpdateEventFormData,
          imageFile: imageFile ?? undefined,
        },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        },
      );
    } else {
      createEvent(
        {
          data: data as CreateEventFormData,
          imageFile: imageFile ?? undefined,
        },
        {
          onSuccess: () => {
            form.reset();
            setImagePreview(null);
            setImageFile(null);
            setStatus("draft");
            onSuccess?.();
          },
        },
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <EventFormFields
        isEditMode={isEditMode}
        isPending={isPending}
        errors={errors}
        register={register}
        setValue={setValue}
        status={status}
        onStatusChange={setStatus}
      />

      <EventBannerUpload
        isPending={isPending}
        errors={errors}
        setValue={setValue}
        imagePreview={imagePreview}
        imageFile={imageFile}
        onImageChange={handleImageChange}
        onRemoveImage={handleRemoveImage}
      />

      <div className="flex justify-end gap-4 pt-4">
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
          {isPending
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
              ? "Update Event"
              : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
