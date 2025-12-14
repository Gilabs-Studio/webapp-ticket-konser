import { getTranslations, getLocale } from "next-intl/server";
import { NotFoundContent } from "@/components/not-found-content";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  const locale = await getLocale();

  return (
    <NotFoundContent
      label={t("label")}
      headline={t("headline")}
      subtext={t("subtext")}
      cta={t("cta")}
      backHome={t("backHome")}
      locale={locale}
    />
  );
}
