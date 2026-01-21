"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "next-themes";
import { type ToasterProps } from "sonner";
import { cn } from "@/lib/utils";

interface ToastProps extends ToasterProps {
  readonly className?: string;
}

function Toaster({ className, ...props }: ToastProps) {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      theme={theme as ToasterProps["theme"]}
      className={cn("toaster group", className)}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-md group-[.toaster]:px-4 group-[.toaster]:py-3 group-[.toaster]:font-sans group-[.toaster]:backdrop-blur-sm",
          description:
            "group-[.toast]:text-muted-foreground group-[.toast]:text-sm group-[.toast]:mt-1",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:transition-all group-[.toast]:hover:opacity-90 group-[.toast]:focus-visible:ring-2 group-[.toast]:focus-visible:ring-ring",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:transition-all group-[.toast]:hover:opacity-90 group-[.toast]:focus-visible:ring-2 group-[.toast]:focus-visible:ring-ring",
          success:
            "group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border",
          error:
            "group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border",
          warning:
            "group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border",
          info: "group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border",
        },
        style: {
          borderRadius: "var(--radius)",
          fontFamily: "var(--font-sans)",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
