"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "@/i18n/routing";
import Beams from "./Beams";
import { Button } from "../../../components/ui/button";
import { ShineBorder } from "../../../components/ui/shine-border";
import { useEventDate } from "@/features/settings/hooks/useEventDate";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface HeroSectionProps {
  locale: string;
}

export default function HeroSection({ locale }: Readonly<HeroSectionProps>) {
  const router = useRouter();
  const { data: eventDate, isLoading, isError } = useEventDate();
  
  // Default date fallback
  const defaultDate = "2025-12-31T00:00:00+07:00";
  const targetDateString = eventDate ?? defaultDate;
  
  // Parse target date with timezone handling
  const targetDate = useMemo(() => {
    try {
      const date = new Date(targetDateString);
      // If date is invalid, use default
      if (isNaN(date.getTime())) {
        return new Date(defaultDate).getTime();
      }
      return date.getTime();
    } catch {
      return new Date(defaultDate).getTime();
    }
  }, [targetDateString]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted state in a separate microtask to avoid synchronous setState in effect
    const mountTimer = setTimeout(() => setMounted(true), 0);

    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          ),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        // Event has passed
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => {
      clearTimeout(mountTimer);
      clearInterval(timer);
    };
  }, [targetDate]);

  if (!mounted || isLoading) {
    return null;
  }

  return (
    <section className="dark relative w-full h-screen overflow-hidden bg-background">
      {/* Beams Background */}
      <div className="absolute inset-0 z-0">
        <Beams
          beamWidth={3}
          beamHeight={30}
          beamNumber={20}
          lightColor="#F4B342"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={30}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        {/* Title */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-light tracking-tight text-foreground mb-8 text-center">
          UMN FESTIVAL
        </h1>

        {/* Countdown */}
        <div className="flex gap-4 md:gap-8 mb-12">
          <div className="flex flex-col items-center">
            <div className="text-4xl md:text-6xl font-extralight tabular-nums text-foreground">
              {String(timeLeft.days).padStart(2, "0")}
            </div>
            <div className="text-xs md:text-sm font-light text-muted-foreground mt-2 uppercase tracking-wider">
              {locale === "id" ? "Hari" : "Days"}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-4xl md:text-6xl font-extralight tabular-nums text-foreground">
              {String(timeLeft.hours).padStart(2, "0")}
            </div>
            <div className="text-xs md:text-sm font-light text-muted-foreground mt-2 uppercase tracking-wider">
              {locale === "id" ? "Jam" : "Hours"}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-4xl md:text-6xl font-extralight tabular-nums text-foreground">
              {String(timeLeft.minutes).padStart(2, "0")}
            </div>
            <div className="text-xs md:text-sm font-light text-muted-foreground mt-2 uppercase tracking-wider">
              {locale === "id" ? "Menit" : "Minutes"}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-4xl md:text-6xl font-extralight tabular-nums text-foreground">
              {String(timeLeft.seconds).padStart(2, "0")}
            </div>
            <div className="text-xs md:text-sm font-light text-muted-foreground mt-2 uppercase tracking-wider">
              {locale === "id" ? "Detik" : "Seconds"}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="relative inline-block rounded-md">
          <ShineBorder
            borderWidth={2}
            duration={14}
            shineColor={[
              "oklch(0.50 0.12 288)",
              "oklch(0.55 0.13 337)",
              "oklch(0.65 0.15 11)",
            ]}
            className="rounded-md"
          />
          <Button 
            className="relative z-10"
            onClick={() => router.push("/events")}
          >
            {locale === "id" ? "Dapatkan Tiket" : "Get Tickets"}
          </Button>
        </div>
      </div>
    </section>
  );
}
