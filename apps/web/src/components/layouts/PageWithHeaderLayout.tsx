"use client";

import { ReactNode } from "react";
import Beams from "@/features/landing/components/Beams";
import Header from "@/components/layouts/Header";
import { useParams } from "next/navigation";

interface PageWithHeaderLayoutProps {
  children: ReactNode;
}

export function PageWithHeaderLayout({ children }: PageWithHeaderLayoutProps) {
  const params = useParams();
  const locale = (params.locale as string) || "en";

  return (
    <div className="dark relative min-h-screen overflow-x-hidden bg-background">
      {/* Beams Background */}
      <div className="fixed inset-0 z-0">
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

      {/* Header */}
      <div className="relative z-50">
        <Header locale={locale} />
      </div>

      {/* Content */}
      <div className="relative z-10 pt-24">
        {children}
      </div>
    </div>
  );
}
