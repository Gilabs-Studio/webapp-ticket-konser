"use client";

import { useForm, useWatch, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  scheduleSchema,
  updateScheduleSchema,
  type ScheduleFormData,
  type UpdateScheduleFormData,
} from "../schemas/schedule.schema";
import {
  useCreateSchedule,
  useUpdateSchedule,
} from "../hooks/useSchedules";
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
import { RundownEditor } from "./RundownEditor";
import { useMemo } from "react";

interface ScheduleFormProps {
  readonly defaultValues?: Partial<ScheduleFormData>;
  readonly scheduleId?: string;
  readonly eventId?: string;
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
  readonly inDialog?: boolean;
}

export function ScheduleForm({
  defaultValues,
  scheduleId,
  eventId,
  onCancel,
  onSuccess,
  inDialog = false,
}: ScheduleFormProps) {
  const { mutate: createSchedule, isPending: isCreating } =
    useCreateSchedule();
  const { mutate: updateSchedule, isPending: isUpdating } =
    useUpdateSchedule();

  const isPending = isCreating || isUpdating;
  const isEditMode = !!scheduleId;

  // Get events for event selection (only if not provided)
  const { data: eventsData } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventService.getEvents({ page: 1, per_page: 100 }),
    staleTime: 30000,
    enabled: !eventId,
  });

  const events = eventsData?.data ?? [];

  const schema = isEditMode
    ? updateScheduleSchema
    : scheduleSchema;

  // Helper function to format date for input type="date"
  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return "";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  // Helper function to format time for input type="time"
  const formatTimeForInput = (timeString?: string): string => {
    if (!timeString) return "";
    try {
      // Handle both "HH:mm:ss" and "HH:mm" formats
      const time = timeString.includes("T")
        ? timeString.split("T")[1]?.split(".")[0]?.slice(0, 5) ?? ""
        : timeString.slice(0, 5);
      return time;
    } catch {
      return "";
    }
  };

  // Prepare default values with proper date/time formatting
  const preparedDefaultValues = useMemo(() => {
    if (!defaultValues) return undefined;
    return {
      ...defaultValues,
      date: defaultValues.date ? formatDateForInput(defaultValues.date) : "",
      start_time: defaultValues.start_time
        ? formatTimeForInput(defaultValues.start_time)
        : "",
      end_time: defaultValues.end_time
        ? formatTimeForInput(defaultValues.end_time)
        : "",
    };
  }, [
    defaultValues?.date,
    defaultValues?.start_time,
    defaultValues?.end_time,
    defaultValues?.session_name,
    defaultValues?.artist_name,
    defaultValues?.rundown,
    defaultValues?.capacity,
    defaultValues?.remaining_seat,
  ]);

  const form = useForm<ScheduleFormData | UpdateScheduleFormData>({
    resolver: zodResolver(schema),
    defaultValues: preparedDefaultValues ?? {
      event_id: eventId ?? "",
      date: "",
      session_name: "",
      start_time: "",
      end_time: "",
      artist_name: "",
      rundown: "",
      capacity: 0,
      remaining_seat: 0,
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = form;

  // Use useWatch to avoid memoization issues
  const formEventId = useWatch({
    control: form.control,
    name: "event_id" as keyof ScheduleFormData,
  }) as string | undefined;

  const onSubmit = (data: ScheduleFormData | UpdateScheduleFormData) => {
    const submitData: ScheduleFormData | UpdateScheduleFormData = {
      ...data,
    };

    // Validate numeric fields
    if ("capacity" in submitData && submitData.capacity !== undefined) {
      const capacity = Number(submitData.capacity);
      if (Number.isNaN(capacity) || capacity < 1) {
        console.error("Invalid capacity value");
        return;
      }
      submitData.capacity = capacity;
    }

    if (
      "remaining_seat" in submitData &&
      submitData.remaining_seat !== undefined
    ) {
      const remainingSeat = Number(submitData.remaining_seat);
      if (Number.isNaN(remainingSeat) || remainingSeat < 0) {
        console.error("Invalid remaining_seat value");
        return;
      }
      submitData.remaining_seat = remainingSeat;
    }

    console.log("Submitting schedule data:", submitData);

    if (isEditMode && scheduleId) {
      updateSchedule(
        {
          id: scheduleId,
          data: submitData as UpdateScheduleFormData,
        },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        },
      );
    } else {
      createSchedule(submitData as ScheduleFormData, {
        onSuccess: () => {
          onSuccess?.();
        },
      });
    }
  };

  const formFields = (
    <div className="space-y-6">
      {!isEditMode && !eventId && (
        <div>
          <Label htmlFor="event_id" className="text-sm">
            Event <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formEventId ?? ""}
            onValueChange={(value) =>
              setValue("event_id" as keyof ScheduleFormData, value)
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
        <Label htmlFor="session_name" className="text-sm">
          Session Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="session_name"
          type="text"
          placeholder="Day 1 - Morning Session"
          {...register("session_name")}
          className={errors.session_name ? "border-destructive" : ""}
          disabled={isPending}
        />
        {errors.session_name && (
          <p className="text-xs text-destructive mt-1">
            {errors.session_name.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="date" className="text-sm">
            Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="date"
            type="date"
            {...register("date")}
            className={errors.date ? "border-destructive" : ""}
            disabled={isPending}
          />
          {errors.date && (
            <p className="text-xs text-destructive mt-1">
              {errors.date.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="start_time" className="text-sm">
            Start Time <span className="text-destructive">*</span>
          </Label>
          <Input
            id="start_time"
            type="time"
            {...register("start_time")}
            className={errors.start_time ? "border-destructive" : ""}
            disabled={isPending}
          />
          {errors.start_time && (
            <p className="text-xs text-destructive mt-1">
              {errors.start_time.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="end_time" className="text-sm">
            End Time <span className="text-destructive">*</span>
          </Label>
          <Input
            id="end_time"
            type="time"
            {...register("end_time")}
            className={errors.end_time ? "border-destructive" : ""}
            disabled={isPending}
          />
          {errors.end_time && (
            <p className="text-xs text-destructive mt-1">
              {errors.end_time.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="artist_name" className="text-sm">
          Artist Name
        </Label>
        <Input
          id="artist_name"
          type="text"
          placeholder="Artist or performer name"
          {...register("artist_name")}
          className={errors.artist_name ? "border-destructive" : ""}
          disabled={isPending}
        />
        {errors.artist_name && (
          <p className="text-xs text-destructive mt-1">
            {errors.artist_name.message}
          </p>
        )}
      </div>

      <RundownEditor disabled={isPending} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="capacity" className="text-sm">
            Capacity <span className="text-destructive">*</span>
          </Label>
          <Input
            id="capacity"
            type="number"
            placeholder="500"
            {...register("capacity", {
              valueAsNumber: true,
              validate: (value) => {
                if (value === undefined || value === null) {
                  return "Capacity is required";
                }
                if (Number.isNaN(value) || value < 1) {
                  return "Capacity must be at least 1";
                }
                return true;
              },
            })}
            className={errors.capacity ? "border-destructive" : ""}
            disabled={isPending}
            min={1}
          />
          {errors.capacity && (
            <p className="text-xs text-destructive mt-1">
              {errors.capacity.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="remaining_seat" className="text-sm">
            Remaining Seat
          </Label>
          <Input
            id="remaining_seat"
            type="number"
            placeholder="500"
            {...register("remaining_seat", {
              valueAsNumber: true,
              validate: (value) => {
                if (value === undefined || value === null) {
                  return true; // Optional
                }
                if (Number.isNaN(value) || value < 0) {
                  return "Remaining seat must be 0 or greater";
                }
                return true;
              },
            })}
            className={errors.remaining_seat ? "border-destructive" : ""}
            disabled={isPending}
            min={0}
          />
          {errors.remaining_seat && (
            <p className="text-xs text-destructive mt-1">
              {errors.remaining_seat.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Leave empty to auto-set to capacity
          </p>
        </div>
      </div>
    </div>
  );

  if (inDialog) {
    return (
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} id="schedule-form">
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
            form="schedule-form"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Update Schedule" : "Create Schedule"}
          </Button>
        </DialogFooter>
      </FormProvider>
    );
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="border border-border bg-card/20 rounded-md p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {isEditMode ? "Edit Schedule" : "Create New Schedule"}
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
              {isEditMode ? "Update Schedule" : "Create Schedule"}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

