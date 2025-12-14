"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Beams from "@/features/landing/components/Beams";
import { Button } from "@/components/ui/button";

interface NotFoundContentProps {
  readonly label: string;
  readonly headline: string;
  readonly subtext: string;
  readonly cta: string;
  readonly backHome: string;
  readonly locale: string;
}

export function NotFoundContent({
  label,
  headline,
  subtext,
  cta,
  backHome,
  locale,
}: NotFoundContentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted state in a separate microtask to avoid synchronous setState in effect
    const mountTimer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(mountTimer);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <section className="dark relative w-full min-h-screen overflow-hidden bg-background">
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
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 md:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl">
          {/* Label - Small, subtle */}
          <p className="text-[9px] font-extralight uppercase tracking-[0.5em] text-muted-foreground/60 mb-16 md:mb-20">
            {label}
          </p>

          {/* Headline - Large, dramatic, unique typography */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-extralight tracking-[-0.02em] text-foreground mb-12 md:mb-16 leading-[0.9]">
            {headline}
          </h1>

          {/* Subtext - Elegant, refined */}
          <p className="text-base md:text-lg lg:text-xl font-light tracking-wide text-muted-foreground/80 mb-6 max-w-2xl leading-relaxed">
            {subtext}
          </p>

          {/* CTA Text - Subtle call to action */}
          <p className="text-sm md:text-base font-light tracking-wide text-muted-foreground/60 mb-16 md:mb-20 max-w-xl">
            {cta}
          </p>

          {/* CTA Button - Premium, no shadow */}
          <Button>
            <Link href={`/${locale}/`}>{backHome}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
