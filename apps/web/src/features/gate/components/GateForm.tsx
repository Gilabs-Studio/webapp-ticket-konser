"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { gateSchema, type GateFormData } from "../schemas/gate.schema";
import { useCreateGate, useUpdateGate } from "../hooks/useGates";
import { Loader2 } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";

interface GateFormProps {
  readonly defaultValues?: Partial<GateFormData>;
  readonly gateId?: string;
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
  readonly inDialog?: boolean;
}

export function GateForm({
  defaultValues,
  gateId,
  onCancel,
  onSuccess,
  inDialog = false,
}: GateFormProps) {
  const { mutate: createGate, isPending: isCreating } = useCreateGate();
  const { mutate: updateGate, isPending: isUpdating } = useUpdateGate();

  const isPending = isCreating || isUpdating;
  const isEditMode = !!gateId;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<GateFormData>({
    resolver: zodResolver(gateSchema),
    defaultValues: defaultValues ?? {
      code: "",
      name: "",
      location: "",
      description: "",
      is_vip: false,
      status: "ACTIVE",
      capacity: 0,
    },
  });

  const isVIP = watch("is_vip");
  const status = watch("status");

  const onSubmit = (data: GateFormData) => {
    if (isEditMode) {
      updateGate(
        {
          id: gateId!,
          request: data,
        },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        },
      );
    } else {
      createGate(data, {
        onSuccess: () => {
          onSuccess?.();
        },
      });
    }
  };

  const formFields = (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="code" className="text-sm">
            Code <span className="text-destructive">*</span>
          </Label>
          <Input
            id="code"
            type="text"
            placeholder="GATE-A"
            {...register("code")}
            className={errors.code ? "border-destructive" : ""}
            disabled={isPending}
          />
          {errors.code && (
            <p className="text-xs text-destructive mt-1">
              {errors.code.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="name" className="text-sm">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Gate A"
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
      </div>

      <div>
        <Label htmlFor="location" className="text-sm">
          Location
        </Label>
        <Input
          id="location"
          type="text"
          placeholder="Main Entrance - North Side"
          {...register("location")}
          className={errors.location ? "border-destructive" : ""}
          disabled={isPending}
        />
        {errors.location && (
          <p className="text-xs text-destructive mt-1">
            {errors.location.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="description" className="text-sm">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Gate description..."
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
          <Label htmlFor="status" className="text-sm">
            Status <span className="text-destructive">*</span>
          </Label>
          <Select
            value={status}
            onValueChange={(value) =>
              setValue("status", value as "ACTIVE" | "INACTIVE")
            }
            disabled={isPending}
          >
            <SelectTrigger
              className={errors.status ? "border-destructive" : ""}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-xs text-destructive mt-1">
              {errors.status.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="capacity" className="text-sm">
            Capacity
          </Label>
          <Input
            id="capacity"
            type="number"
            placeholder="0 (unlimited)"
            {...register("capacity", { valueAsNumber: true })}
            className={errors.capacity ? "border-destructive" : ""}
            disabled={isPending}
            min={0}
          />
          {errors.capacity && (
            <p className="text-xs text-destructive mt-1">
              {errors.capacity.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Set to 0 for unlimited capacity
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_vip"
          checked={isVIP}
          onCheckedChange={(checked) => setValue("is_vip", checked)}
          disabled={isPending}
        />
        <Label htmlFor="is_vip" className="text-sm cursor-pointer">
          VIP Gate
        </Label>
      </div>
    </div>
  );

  if (inDialog) {
    return (
      <>
        <form onSubmit={handleSubmit(onSubmit)} id="gate-form">
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
            form="gate-form"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Update Gate" : "Create Gate"}
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
            {isEditMode ? "Edit Gate" : "Create New Gate"}
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
            {isEditMode ? "Update Gate" : "Create Gate"}
          </Button>
        </div>
      </div>
    </form>
  );
}
