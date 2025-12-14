import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import type { Locale } from "@/types/locale";
import enMessages from "./messages/en.json";
import idMessages from "./messages/id.json";
// Feature messages
import checkinEnMessages from "@/features/checkin/messages/en.json";
import checkinIdMessages from "@/features/checkin/messages/id.json";

// Merge global and feature messages
const messages = {
  en: {
    ...enMessages,
    checkin: checkinEnMessages,
  },
  id: {
    ...idMessages,
    checkin: checkinIdMessages,
  },
} as const;

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: messages[locale as keyof typeof messages],
  };
});
