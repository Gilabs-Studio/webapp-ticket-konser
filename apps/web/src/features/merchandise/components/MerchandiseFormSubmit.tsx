"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";

interface MerchandiseFormSubmitProps {
  readonly isPending: boolean;
  readonly isEditMode: boolean;
  readonly inDialog: boolean;
  readonly onCancel?: () => void;
}

export function MerchandiseFormSubmit({
  isPending,
  isEditMode,
  inDialog,
  onCancel,
}: MerchandiseFormSubmitProps) {
  const submitButton = (
    <Button type="submit" disabled={isPending} form={inDialog ? "merchandise-form" : undefined}>
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isEditMode ? "Update Product" : "Create Product"}
    </Button>
  );

  if (inDialog) {
    return (
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
        {submitButton}
      </DialogFooter>
    );
  }

  return (
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
      {submitButton}
    </div>
  );
}
