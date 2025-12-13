"use client";

import type { ReactNode } from "react";
import Beams from "@/features/landing/components/Beams";

interface AuthLayoutProps {
  readonly children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-background">
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
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </section>
  );
}
