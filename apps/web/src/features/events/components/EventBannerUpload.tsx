"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SafeImage } from "@/components/ui/image";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FieldErrors, UseFormSetValue } from "react-hook-form";
import type {
  CreateEventFormData,
  UpdateEventFormData,
} from "../schemas/event.schema";

interface EventBannerUploadProps {
  readonly isPending: boolean;
  readonly errors: FieldErrors<CreateEventFormData | UpdateEventFormData>;
  readonly setValue: UseFormSetValue<
    CreateEventFormData | UpdateEventFormData
  >;
  readonly imagePreview: string | null;
  readonly imageFile: File | null;
  readonly onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onRemoveImage: () => void;
}

export function EventBannerUpload({
  isPending,
  errors,
  setValue,
  imagePreview,
  imageFile,
  onImageChange,
  onRemoveImage,
}: EventBannerUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      return "Invalid file type. Please upload JPEG, PNG, or WebP image.";
    }

    if (file.size > maxSize) {
      return "File size exceeds 5MB limit.";
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      // Set error via form validation
      setValue("bannerImage", "", { shouldValidate: true });
      return;
    }

    onImageChange(e);
  };

  return (
    <div>
      <Label htmlFor="banner" className="text-sm">
        Banner Image
      </Label>
      <div className="space-y-4">
        {imagePreview ? (
          <div className="relative">
            <div className="relative aspect-video w-full max-w-2xl border border-border rounded-xl overflow-hidden bg-muted">
              <SafeImage
                src={imagePreview}
                alt="Banner preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
                fallbackIcon={true}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 z-10"
                onClick={onRemoveImage}
                disabled={isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {imageFile && (
              <p className="text-xs text-muted-foreground mt-2">
                File: {imageFile.name ?? "Unknown"} (
                {(imageFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        ) : (
          <button
            type="button"
            className={cn(
              "w-full border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-ring",
              errors.bannerImage && "border-destructive",
            )}
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
          >
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, WEBP up to 5MB
            </p>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          id="banner"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={isPending}
        />
        {!imagePreview && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
          >
            <Upload className="h-4 w-4 mr-2" />
            Select Banner
          </Button>
        )}
        {errors.bannerImage && (
          <p className="text-xs text-destructive mt-1">
            {errors.bannerImage.message}
          </p>
        )}
      </div>
    </div>
  );
}



