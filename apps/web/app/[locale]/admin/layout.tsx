"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Link, usePathname } from "@/i18n/routing";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Ticket,
  ShoppingCart,
  Settings,
  BarChart3,
  ChevronDown,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { UserMenu } from "@/components/user-menu";
import { ThemeToggleButton } from "@/components/ui/theme-toggle";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { LogOut } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";

interface AdminLayoutProps {
  readonly children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const t = useTranslations("admin");
  const { user } = useAuthStore();
  const handleLogout = useLogout();

  const overviewItems = [
    {
      title: t("menu.dashboard"),
      url: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t("menu.tickets"),
      url: "/admin/tickets",
      icon: Ticket,
    },
    {
      title: t("menu.merchandise"),
      url: "/admin/merchandise",
      icon: ShoppingCart,
    },
    {
      title: t("menu.attendees"),
      url: "/admin/attendees",
      icon: Users,
    },
  ];

  const managementItems = [
    {
      title: t("menu.analytics"),
      url: "/admin/analytics",
      icon: BarChart3,
    },
    {
      title: t("menu.settings"),
      url: "/admin/settings",
      icon: Settings,
    },
  ];

  const initials = user?.name
    ?.split(" ")
    .map((n) => n?.[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "A";

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Ticket className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold">UMN FESTIVAL</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-4">
          <SidebarMenu>
            {overviewItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.url || pathname?.startsWith(item.url + "/");
              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
          <SidebarGroup>
            <SidebarGroupLabel>{t("menu.management")}</SidebarGroupLabel>
            <SidebarMenu>
              {managementItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.url ||
                  pathname?.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar_url} alt={user?.name ?? "User"} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col items-start text-left text-sm">
                  <span className="font-medium">{user?.name ?? "User"}</span>
                  <span className="text-xs text-muted-foreground">
                    {user?.email ?? ""}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name ?? "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email ?? ""}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-6">
          <div className="flex items-center gap-4 flex-1">
            {/* Breadcrumb */}
            <div className="flex-1">
              <Breadcrumb />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Search - placeholder for now */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border bg-muted/50 text-sm text-muted-foreground">
              <span>Q</span>
              <span>Search orders...</span>
            </div>
            {/* Notifications - placeholder */}
            <button className="relative p-2 rounded-md hover:bg-muted">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            <ThemeToggleButton />
            <UserMenu />
          </div>
        </header>
        <main className="flex flex-1 flex-col overflow-auto bg-muted/30">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
