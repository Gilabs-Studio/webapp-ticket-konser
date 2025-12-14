"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types/locale";
import { useTransition } from "react";

export function LanguageToggleButton({
  className = "",
}: Readonly<{
  className?: string;
}>) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const toggleLanguage = () => {
    const newLocale = locale === "en" ? "id" : "en";

    // Use startTransition to avoid flash screen
    if (typeof document !== "undefined" && document.startViewTransition) {
      document.startViewTransition(() => {
        startTransition(() => {
          router.replace(pathname, { locale: newLocale });
        });
      });
    } else {
      startTransition(() => {
        router.replace(pathname, { locale: newLocale });
      });
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 rounded-full bg-background/80 text-foreground shadow-sm transition-all duration-200 hover:bg-accent/60 active:scale-95",
        isPending && "opacity-50 cursor-wait",
        className,
      )}
      onClick={toggleLanguage}
      disabled={isPending}
      aria-label={`Switch to ${locale === "en" ? "Indonesian" : "English"}`}
    >
      <span className="text-xs font-light uppercase tracking-wide">
        {locale === "en" ? "ID" : "EN"}
      </span>
    </Button>
  );
}
