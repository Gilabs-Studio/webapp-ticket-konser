import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  const locale = await getLocale();

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="flex flex-col items-center text-center space-y-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
          {t("label")}
        </p>

        <h1 className="text-base sm:text-lg font-semibold text-foreground">
          {t("title")}
        </h1>

        <p className="max-w-sm text-xs sm:text-sm text-muted-foreground">
          {t("description")}
        </p>

        <Button asChild size="sm" className="mt-2">
          {/* Kembalikan user ke login sesuai locale, mis. "/en/login" */}
          <Link href={`/${locale}/login`}>{t("backHome")}</Link>
        </Button>
      </div>
    </main>
  );
}
