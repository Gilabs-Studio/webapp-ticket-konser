"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";
import type { ScheduleFormData } from "../schemas/schedule.schema";

interface RundownEditorProps {
  readonly disabled?: boolean;
  readonly className?: string;
}

export function RundownEditor({
  disabled = false,
  className,
}: RundownEditorProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<ScheduleFormData>();

  return (
    <div className={className}>
      <Label htmlFor="rundown" className="text-sm">
        Rundown
      </Label>
      <Textarea
        id="rundown"
        placeholder="Enter rundown details (one item per line)&#10;Example:&#10;19:00 - Opening Act&#10;20:00 - Main Performance&#10;21:30 - Closing"
        rows={8}
        {...register("rundown")}
        className={errors.rundown ? "border-destructive" : ""}
        disabled={disabled}
      />
      {errors.rundown && (
        <p className="text-xs text-destructive mt-1">
          {errors.rundown.message}
        </p>
      )}
      <p className="text-xs text-muted-foreground mt-1">
        Enter each item on a new line. Line breaks will be preserved.
      </p>
    </div>
  );
}

