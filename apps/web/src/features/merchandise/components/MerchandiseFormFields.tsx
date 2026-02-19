"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
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
import type { MerchandiseFormData, UpdateMerchandiseFormData } from "../schemas/merchandise.schema";

interface MerchandiseFormFieldsProps {
  readonly isEditMode: boolean;
  readonly isPending: boolean;
  readonly errors: FieldErrors<MerchandiseFormData | UpdateMerchandiseFormData>;
  readonly register: UseFormRegister<MerchandiseFormData | UpdateMerchandiseFormData>;
  readonly eventId?: string;
  readonly events: Array<{ id: string; eventName: string }>;
  readonly onEventChange: (value: string) => void;
}

export function MerchandiseFormFields({
  isEditMode,
  isPending,
  errors,
  register,
  eventId,
  events,
  onEventChange,
}: MerchandiseFormFieldsProps) {
  return (
    <div className="space-y-6">
      {!isEditMode && (
        <div>
          <Label htmlFor="event_id" className="text-sm">
            Event <span className="text-destructive">*</span>
          </Label>
          <Select
            value={eventId ?? ""}
            onValueChange={onEventChange}
            disabled={isPending}
          >
            <SelectTrigger
              className={("event_id" in errors && errors.event_id) ? "border-destructive" : ""}
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
        <Label htmlFor="name" className="text-sm">
          Product Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="T-Shirt"
          {...register("name")}
          className={errors.name ? "border-destructive" : ""}
          disabled={isPending}
        />
        {errors.name && (
          <p className="text-xs text-destructive mt-1">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="description" className="text-sm">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Product description..."
          {...register("description")}
          className={errors.description ? "border-destructive" : ""}
          disabled={isPending}
          rows={3}
        />
        {errors.description && (
          <p className="text-xs text-destructive mt-1">
            {errors.description.message}
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
            placeholder="100000"
            step="1000"
            {...register("price", { 
              valueAsNumber: true,
              validate: (value) => {
                if (value === undefined || value === null || Number.isNaN(value) || value < 0) {
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
          <Label htmlFor="stock" className="text-sm">
            Stock <span className="text-destructive">*</span>
          </Label>
          <Input
            id="stock"
            type="number"
            placeholder="100"
            {...register("stock", { 
              valueAsNumber: true,
              validate: (value) => {
                if (value === undefined || value === null || Number.isNaN(value) || value < 0) {
                  return "Stock must be a valid number greater than or equal to 0";
                }
                return true;
              }
            })}
            className={errors.stock ? "border-destructive" : ""}
            disabled={isPending}
            min={0}
          />
          {errors.stock && (
            <p className="text-xs text-destructive mt-1">
              {errors.stock.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="variant" className="text-sm">
          Variant
        </Label>
        <Input
          id="variant"
          type="text"
          placeholder="Size, Color, etc."
          {...register("variant")}
          className={errors.variant ? "border-destructive" : ""}
          disabled={isPending}
        />
        {errors.variant && (
          <p className="text-xs text-destructive mt-1">
            {errors.variant.message}
          </p>
        )}
      </div>
    </div>
  );
}
