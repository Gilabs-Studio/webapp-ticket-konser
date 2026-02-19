"use client";

import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CreateEventFormData,
  UpdateEventFormData,
} from "../schemas/event.schema";

interface EventFormFieldsProps {
  readonly isEditMode: boolean;
  readonly isPending: boolean;
  readonly errors: FieldErrors<CreateEventFormData | UpdateEventFormData>;
  readonly register: UseFormRegister<
    CreateEventFormData | UpdateEventFormData
  >;
  readonly setValue: UseFormSetValue<CreateEventFormData | UpdateEventFormData>;
  readonly status?: string;
  readonly onStatusChange?: (value: string) => void;
}

export function EventFormFields({
  isEditMode,
  isPending,
  errors,
  register,
  setValue,
  status,
  onStatusChange,
}: EventFormFieldsProps) {
  const handleStatusChange = (value: string) => {
    setValue("status", value as "draft" | "published" | "closed", {
      shouldValidate: true,
    });
    onStatusChange?.(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="eventName" className="text-sm">
          Event Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="eventName"
          type="text"
          placeholder="Harry Potter Museum Exhibition"
          {...register("eventName")}
          className={errors.eventName ? "border-destructive" : ""}
          disabled={isPending}
        />
        {errors.eventName && (
          <p className="text-xs text-destructive mt-1">
            {errors.eventName.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="description" className="text-sm">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Event description..."
          {...register("description")}
          className={errors.description ? "border-destructive" : ""}
          disabled={isPending}
          rows={4}
        />
        {errors.description && (
          <p className="text-xs text-destructive mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate" className="text-sm">
            Start Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="startDate"
            type="date"
            {...register("startDate")}
            className={errors.startDate ? "border-destructive" : ""}
            disabled={isPending}
          />
          {errors.startDate && (
            <p className="text-xs text-destructive mt-1">
              {errors.startDate.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="endDate" className="text-sm">
            End Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="endDate"
            type="date"
            {...register("endDate")}
            className={errors.endDate ? "border-destructive" : ""}
            disabled={isPending}
          />
          {errors.endDate && (
            <p className="text-xs text-destructive mt-1">
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="status" className="text-sm">
          Status
        </Label>
        <Select
          value={status ?? "draft"}
          onValueChange={handleStatusChange}
          disabled={isPending}
        >
          <SelectTrigger
            className={
              errors.status ? "border-destructive" : ""
            }
          >
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-xs text-destructive mt-1">
            {errors.status.message}
          </p>
        )}
      </div>
    </div>
  );
}



