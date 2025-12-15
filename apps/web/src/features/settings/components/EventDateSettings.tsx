"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useEventDateSettings } from "../hooks/useEventDateSettings";
import { motion } from "framer-motion";

export function EventDateSettings() {
  const { eventDate, isLoading, updateEventDate, isUpdating } = useEventDateSettings();

  // Parse event date with useMemo to avoid cascading renders
  const parsedDateTime = useMemo(() => {
    if (!eventDate || isLoading) {
      return { date: null, time: null };
    }

    try {
      const date = new Date(eventDate);
      if (!Number.isNaN(date.getTime())) {
        // Extract time (HH:mm) from ISO string
        const timeStr = date.toTimeString().slice(0, 5);
        return { date, time: timeStr };
      }
    } catch {
      // Invalid date, use default
      const defaultDate = new Date("2025-12-31T00:00:00+07:00");
      return { date: defaultDate, time: "00:00" };
    }

    return { date: null, time: null };
  }, [eventDate, isLoading]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(parsedDateTime.date);
  const [selectedTime, setSelectedTime] = useState<string | null>(parsedDateTime.time);

  // Update state when parsedDateTime changes
  useEffect(() => {
    setSelectedDate(parsedDateTime.date);
    setSelectedTime(parsedDateTime.time);
  }, [parsedDateTime]);

  const handleDateTimeChange = (date: Date | null, time: string | null) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  const handleSave = () => {
    if (!selectedDate) return;

    // Combine date and time, set timezone to WIB (UTC+7)
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const time = selectedTime || "00:00";
    
    // Create ISO string with WIB timezone
    const isoDate = `${year}-${month}-${day}T${time}:00+07:00`;
    updateEventDate(isoDate);
  };

  // Calculate preview countdown
  const [previewCountdown, setPreviewCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!selectedDate || !selectedTime) return;

    const calculatePreview = () => {
      // Parse date and time, create date string in WIB timezone format
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      
      // Create ISO string with WIB timezone (UTC+7)
      const isoString = `${year}-${month}-${day}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00+07:00`;
      const targetDate = new Date(isoString);
      const now = Date.now();
      const difference = targetDate.getTime() - now;

      if (difference > 0) {
        setPreviewCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          ),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setPreviewCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
      }
    };

    calculatePreview();
    const timer = setInterval(calculatePreview, 1000);

    return () => clearInterval(timer);
  }, [selectedDate, selectedTime]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="max-w-2xl mx-auto space-y-12 py-12"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-foreground">
          Event Date
        </h1>
        <p className="text-sm font-light text-muted-foreground tracking-wide">
          Set the date and time for the countdown timer
        </p>
      </div>

      {/* Date Time Picker */}
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <DateTimePicker
            date={selectedDate}
            time={selectedTime}
            onDateChange={handleDateTimeChange}
            disabled={isLoading || isUpdating}
          />
        </div>

        {/* Preview Countdown */}
        {selectedDate && selectedTime && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="pt-8 border-t border-border"
          >
            <p className="text-xs font-light text-muted-foreground mb-6 text-center uppercase tracking-wider">
              Preview
            </p>
            <div className="flex gap-4 md:gap-8 justify-center">
              <div className="flex flex-col items-center">
                <div className="text-4xl md:text-5xl font-extralight tabular-nums text-foreground">
                  {String(previewCountdown.days).padStart(2, "0")}
                </div>
                <div className="text-xs font-light text-muted-foreground mt-2 uppercase tracking-wider">
                  Days
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-4xl md:text-5xl font-extralight tabular-nums text-foreground">
                  {String(previewCountdown.hours).padStart(2, "0")}
                </div>
                <div className="text-xs font-light text-muted-foreground mt-2 uppercase tracking-wider">
                  Hours
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-4xl md:text-5xl font-extralight tabular-nums text-foreground">
                  {String(previewCountdown.minutes).padStart(2, "0")}
                </div>
                <div className="text-xs font-light text-muted-foreground mt-2 uppercase tracking-wider">
                  Minutes
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-4xl md:text-5xl font-extralight tabular-nums text-foreground">
                  {String(previewCountdown.seconds).padStart(2, "0")}
                </div>
                <div className="text-xs font-light text-muted-foreground mt-2 uppercase tracking-wider">
                  Seconds
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Save Button */}
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleSave}
            disabled={isLoading || isUpdating || !selectedDate}
            className="min-w-[140px] font-light tracking-wide"
            size="lg"
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
