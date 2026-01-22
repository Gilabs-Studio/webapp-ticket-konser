"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SafeImage } from "@/components/ui/image";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FieldErrors, UseFormSetValue } from "react-hook-form";
import type { MerchandiseFormData, UpdateMerchandiseFormData } from "../schemas/merchandise.schema";

interface MerchandiseImageUploadProps {
  readonly isPending: boolean;
  readonly errors: FieldErrors<MerchandiseFormData | UpdateMerchandiseFormData>;
  readonly setValue: UseFormSetValue<MerchandiseFormData | UpdateMerchandiseFormData>;
  readonly imagePreview: string | null;
  readonly imageFile: File | null;
  readonly onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onRemoveImage: () => void;
}

export function MerchandiseImageUpload({
  isPending,
  errors,
  setValue,
  imagePreview,
  imageFile,
  onImageChange,
  onRemoveImage,
}: MerchandiseImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <Label htmlFor="image" className="text-sm">
        Product Image
      </Label>
      <div className="space-y-4">
        {imagePreview ? (
          <div className="relative">
            <div className="relative aspect-square w-full max-w-xs border border-border rounded-md overflow-hidden bg-muted">
              <SafeImage
                src={imagePreview}
                alt="Product preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
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
                File: {imageFile.name ?? "Unknown"} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        ) : (
          <button
            type="button"
            className={cn(
              "w-full border-2 border-dashed border-border rounded-md p-8 text-center cursor-pointer transition-colors hover:border-ring",
              errors.image_url && "border-destructive"
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
          id="image"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={onImageChange}
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
            Select Image
          </Button>
        )}
        {errors.image_url && (
          <p className="text-xs text-destructive mt-1">
            {errors.image_url.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Note: Image upload will be processed when backend is ready.
        </p>
      </div>
    </div>
  );
}
