"use client";

import NextImage from "next/image";
import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SafeImageProps {
  readonly src?: string | null;
  readonly alt: string;
  readonly fill?: boolean;
  readonly width?: number;
  readonly height?: number;
  readonly className?: string;
  readonly sizes?: string;
  readonly fallback?: React.ReactNode;
  readonly fallbackIcon?: boolean;
  readonly priority?: boolean;
}

function isDataOrBlobUrl(src: string): boolean {
  return src.startsWith("data:") || src.startsWith("blob:");
}

function isExternalUrl(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://");
}

function shouldUnoptimizeImage(src: string): boolean {
  return isExternalUrl(src) || isDataOrBlobUrl(src);
}

function DefaultFallbackIcon({
  fill,
  width,
  height,
  className,
}: {
  readonly fill: boolean;
  readonly width?: number;
  readonly height?: number;
  readonly className?: string;
}) {
  if (fill) {
    return (
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-muted",
          className,
        )}
      >
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-muted",
        className,
      )}
      style={{ width, height }}
    >
      <ImageIcon className="h-8 w-8 text-muted-foreground" />
    </div>
  );
}

function LoadingFallback({
  fill,
  width,
  height,
  className,
}: {
  readonly fill: boolean;
  readonly width?: number;
  readonly height?: number;
  readonly className?: string;
}) {
  return (
    <div
      className={cn(
        fill
          ? "absolute inset-0 flex items-center justify-center bg-muted"
          : "flex items-center justify-center bg-muted",
        className,
      )}
      style={fill ? undefined : { width, height }}
    >
      <ImageIcon className="h-8 w-8 text-muted-foreground animate-pulse" />
    </div>
  );
}

/**
 * Internal image component that manages its own state
 * Wrapped with key to force remount when src changes
 */
function SafeImageInner({
  src,
  alt,
  fill = false,
  width,
  height,
  className,
  sizes,
  fallback,
  fallbackIcon = true,
  priority = false,
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle null/undefined src - ALWAYS check first (Null Safety)
  const safeSrc = src?.trim() ?? "";
  if (!safeSrc || hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (fallbackIcon) {
      return (
        <DefaultFallbackIcon
          fill={fill}
          width={width}
          height={height}
          className={className}
        />
      );
    }

    return null;
  }

  // Determine if image should be unoptimized (for external/data URLs)
  const shouldUnoptimize = shouldUnoptimizeImage(safeSrc);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && fallbackIcon && (
        <LoadingFallback
          fill={fill}
          width={width}
          height={height}
          className={className}
        />
      )}
      <NextImage
        src={safeSrc}
        alt={alt ?? "Image"}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={cn(isLoading && "opacity-0", className)}
        sizes={sizes}
        priority={priority}
        unoptimized={shouldUnoptimize}
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  );
}

/**
 * Safe Image component with fallback handling
 * - Handles null/undefined src with fallback
 * - Handles external images (unconfigured hostnames) with unoptimized mode
 * - Handles image load errors gracefully
 * - Provides default fallback UI
 * - Uses key prop to force remount when src changes, resetting state automatically
 */
export function SafeImage(props: SafeImageProps) {
  // Use src as key to force remount when src changes
  // This automatically resets state without needing useEffect or setState in render
  const imageKey = props.src ?? "";
  
  return <SafeImageInner key={imageKey} {...props} />;
}
