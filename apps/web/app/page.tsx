import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

export default function RootRedirectPage() {
  // Redirect root "/" to default locale landing page
  redirect(`/${routing.defaultLocale}`);
}
