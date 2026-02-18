"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { UserMenu } from "@/components/user-menu";
import { ThemeToggleButton } from "@/components/ui/theme-toggle";
import { LanguageToggleButton } from "@/components/ui/language-toggle";
import { getNormalizedRoleCode } from "@/features/auth/utils/role";

interface HeaderProps {
  readonly locale: string;
}

export default function Header({ locale }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { label: "Event", href: "/events" },
    { label: "Merchandise", href: "/merchandise" },
    { label: "Ticket", href: "/events" },
    { label: "About Us", href: "#about" },
  ];

  // Determine user role for menu customization
  const userRole = getNormalizedRoleCode(user?.role);
  const isAdmin = ["admin", "super_admin"].includes(userRole);
  const isStaff = ["staff_ticket", "gate_staff", "gatekeeper"].includes(userRole);
  const isGuest = Boolean(isAuthenticated && user && !isAdmin && !isStaff);

  return (
    <header
      className={`dark fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-foreground/10"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <ul className="flex items-center justify-center gap-8 md:gap-12">
            {menuItems.map((item) => (
              <li key={item.label}>
                {item.href.startsWith("#") ? (
                  <a
                    href={item.href}
                    className="text-sm font-light tracking-wide uppercase text-foreground/70 hover:text-foreground transition-colors duration-300 relative group"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-[var(--gradient-purple)] via-[var(--gradient-magenta)] to-[var(--gradient-pink)] group-hover:w-full transition-all duration-300" />
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="text-sm font-light tracking-wide uppercase text-foreground/70 hover:text-foreground transition-colors duration-300 relative group"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-[var(--gradient-purple)] via-[var(--gradient-magenta)] to-[var(--gradient-pink)] group-hover:w-full transition-all duration-300" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <LanguageToggleButton />
            <ThemeToggleButton />
            {isAuthenticated && user ? (
              <UserMenu
                showHistory={isGuest}
                isAdmin={isAdmin}
                isStaff={isStaff}
              />
            ) : (
              <Button
                asChild
                variant="outline"
                className="text-sm font-light tracking-wide uppercase border-foreground/30 text-foreground hover:border-foreground/50 hover:bg-foreground/10 bg-background/50"
              >
                <Link href={`/login`}>Login</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
