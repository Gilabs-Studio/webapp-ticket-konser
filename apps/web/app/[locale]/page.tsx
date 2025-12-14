import HeroSection from "@/features/landing/components/HeroSection";
import Header from "@/components/layouts/Header";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  return (
    <main className="min-h-screen">
      <Header locale={locale} />
      <HeroSection locale={locale} />
    </main>
  );
}
