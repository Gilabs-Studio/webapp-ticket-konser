import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReactQueryProvider } from "@/lib/react-query";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppLayout } from "@/components/layouts/app-layout";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ticket Konser - Web App",
  description: "Web application for ticket management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <AppLayout>
              {children}
            </AppLayout>
            <Toaster position="top-right" richColors />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

