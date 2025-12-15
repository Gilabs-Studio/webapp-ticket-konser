"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { eventService } from "@/features/events/services/eventService";
import {
  merchandiseSchema,
  updateMerchandiseSchema,
  type MerchandiseFormData,
  type UpdateMerchandiseFormData,
} from "../schemas/merchandise.schema";
import {
  useCreateMerchandise,
  useUpdateMerchandise,
} from "../hooks/useMerchandise";
import { MerchandiseFormFields } from "./MerchandiseFormFields";
import { MerchandiseImageUpload } from "./MerchandiseImageUpload";
import { MerchandiseFormSubmit } from "./MerchandiseFormSubmit";

interface MerchandiseFormProps {
  readonly defaultValues?: Partial<MerchandiseFormData>;
  readonly merchandiseId?: string;
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
  readonly inDialog?: boolean;
}

export function MerchandiseForm({
  defaultValues,
  merchandiseId,
  onCancel,
  onSuccess,
  inDialog = false,
}: MerchandiseFormProps) {
  const { mutate: createMerchandise, isPending: isCreating } =
    useCreateMerchandise();
  const { mutate: updateMerchandise, isPending: isUpdating } =
    useUpdateMerchandise();

  const isPending = isCreating || isUpdating;
  const [imagePreview, setImagePreview] = useState<string | null>(
    defaultValues?.image_url ?? null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [eventId, setEventId] = useState<string>(
    defaultValues?.event_id ?? ""
  );

  const isEditMode = !!merchandiseId;

  // Update image preview when defaultValues change (e.g., after refetch)
  useEffect(() => {
    if (defaultValues?.image_url) {
      setImagePreview(defaultValues.image_url);
    }
  }, [defaultValues?.image_url]);

  // Get events for event selection
  const { data: eventsData } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventService.getEvents({ page: 1, per_page: 100 }),
    staleTime: 30000,
  });

  const events = eventsData?.data ?? [];

  const schema = isEditMode
    ? updateMerchandiseSchema
    : merchandiseSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<MerchandiseFormData | UpdateMerchandiseFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      event_id: "",
      name: "",
      description: "",
      price: 0,
      stock: 0,
      variant: "",
      image_url: "",
      icon_name: "Package",
    },
    mode: "onChange",
  });

  const handleEventChange = (value: string) => {
    setEventId(value);
    setValue("event_id" as keyof MerchandiseFormData, value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        console.error("Invalid file type. Please select an image file.");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.error("File size exceeds 5MB limit.");
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Note: For now, we'll store the file locally
      // Backend upload will be implemented later
      // For now, we'll just store the file and pass it to onSubmit
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setValue("image_url" as keyof MerchandiseFormData, "");
  };

  const validateNumericField = (
    value: number | string | undefined,
    fieldName: string
  ): number | null => {
    if (value === undefined) return null;
    const numValue = typeof value === "string" 
      ? Number.parseFloat(value) 
      : value;
    if (Number.isNaN(numValue) || numValue < 0) {
      console.error(`Invalid ${fieldName} value:`, value);
      return null;
    }
    return numValue;
  };

  const validateRequiredFields = (
    data: MerchandiseFormData | UpdateMerchandiseFormData
  ): boolean => {
    if (!isEditMode) {
      const createData = data as MerchandiseFormData;
      if (!createData.event_id || createData.event_id.trim() === "") {
        console.error("Event ID is required");
        return false;
      }
      if (!createData.name || createData.name.trim() === "") {
        console.error("Name is required");
        return false;
      }
    }
    return true;
  };

  const onFormSubmit = (data: MerchandiseFormData | UpdateMerchandiseFormData) => {
    const submitData: MerchandiseFormData | UpdateMerchandiseFormData = {
      ...data,
    };

    // Convert and validate numeric fields
    if ("price" in submitData && submitData.price !== undefined) {
      const price = validateNumericField(submitData.price, "price");
      if (price === null) return;
      submitData.price = price;
    }

    if ("stock" in submitData && submitData.stock !== undefined) {
      const stock = validateNumericField(submitData.stock, "stock");
      if (stock === null) return;
      submitData.stock = stock;
    }

    // Validate required fields for create mode
    if (!validateRequiredFields(submitData)) {
      return;
    }

    // Ensure event_id is set for create mode
    if (!isEditMode) {
      (submitData as MerchandiseFormData).event_id = eventId;
    }

    // Log data being sent for debugging
    console.log("Submitting merchandise data:", submitData);
    console.log("Image file:", imageFile);

    if (isEditMode && merchandiseId) {
      updateMerchandise(
        {
          id: merchandiseId,
          data: submitData as UpdateMerchandiseFormData,
          imageFile: imageFile ?? undefined,
        },
        {
          onSuccess: (response) => {
            // If image was uploaded, update preview with new image URL
            if (imageFile && response?.data?.imageUrl) {
              setImagePreview(response.data.imageUrl);
              setImageFile(null); // Clear file since it's now uploaded
              setValue("image_url" as keyof UpdateMerchandiseFormData, response.data.imageUrl);
            }
            onSuccess?.();
          },
        },
      );
    } else {
      createMerchandise(
        {
          data: submitData as MerchandiseFormData,
          imageFile: imageFile ?? undefined,
        },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        },
      );
    }
  };

  const formFields = (
    <div className="space-y-6">
      <MerchandiseFormFields
        isEditMode={isEditMode}
        isPending={isPending}
        errors={errors}
        register={register}
        eventId={isEditMode ? undefined : eventId}
        events={events}
        onEventChange={handleEventChange}
      />
      <MerchandiseImageUpload
        isPending={isPending}
        errors={errors}
        setValue={setValue}
        imagePreview={imagePreview}
        imageFile={imageFile}
        onImageChange={handleImageChange}
        onRemoveImage={handleRemoveImage}
      />
    </div>
  );

  if (inDialog) {
    return (
      <>
        <form onSubmit={handleSubmit(onFormSubmit)} id="merchandise-form">
          {formFields}
        </form>
        <MerchandiseFormSubmit
          isPending={isPending}
          isEditMode={isEditMode}
          inDialog={true}
          onCancel={onCancel}
        />
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <div className="border border-border bg-card/20 rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {isEditMode ? "Edit Merchandise" : "Create New Merchandise"}
          </h3>
        </div>
        {formFields}
        <MerchandiseFormSubmit
          isPending={isPending}
          isEditMode={isEditMode}
          inDialog={false}
          onCancel={onCancel}
        />
      </div>
    </form>
  );
}


