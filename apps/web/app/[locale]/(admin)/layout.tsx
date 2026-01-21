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
  Ticket,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { UserMenu } from "@/components/user-menu";
import { ThemeToggleButton } from "@/components/ui/theme-toggle";
import { LanguageToggleButton } from "@/components/ui/language-toggle";
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
import { Breadcrumb } from "@/components/breadcrumb";
import { useMenus, categorizeMenus } from "@/features/auth/hooks/useMenus";
import { getMenuIcon } from "@/lib/menu-icons";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminLayoutProps {
  readonly children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const t = useTranslations("admin");
  const { user, isAuthenticated } = useAuthStore();
  const handleLogout = useLogout();

  // Fetch menus from API
  const {
    data: menusData,
    isLoading: isLoadingMenus,
    isError: isErrorMenus,
  } = useMenus({
    enabled: isAuthenticated,
  });

  // Categorize menus into Overview, Event Operations, People, and System
  const categorizedMenus = menusData
    ? categorizeMenus(menusData.menus)
    : {
        overview: [],
        event_operations: [],
        manage_people: [],
        system: [],
      };
  const { overview, event_operations, manage_people, system } =
    categorizedMenus;

  // Helper function to normalize menu path
  const normalizeMenuPath = (path: string): string => {
    if (path.startsWith("/")) {
      return path;
    }
    return `/${path}`;
  };

  // Label mapping for shorter sidebar names
  const menuLabelMap: Record<string, string> = {
    "Event Management": "Events",
    "Ticket Management": "Tickets",
    "Gate Management": "Gates",
    "Merchandise Management": "Merchandise",
    "User Management": "Users",
  };

  const getLabel = (label: string): string => {
    return menuLabelMap[label] || label;
  };

  // Render sidebar content based on loading/error state
  const renderSidebarContent = () => {
    if (isLoadingMenus) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }

    if (isErrorMenus) {
      return (
        <div className="p-4 text-sm text-muted-foreground">
          {t("menu.error")}
        </div>
      );
    }

    return (
      <>
        <SidebarMenu>
          {overview.map((menu) => {
            const normalizedPath = normalizeMenuPath(menu.path);
            const isActive =
              pathname === normalizedPath ||
              pathname?.startsWith(`${normalizedPath}/`);
            return (
              <SidebarMenuItem key={menu.id}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={getLabel(menu.label)}
                >
                  <Link href={normalizedPath}>
                    {getMenuIcon(menu.icon)}
                    <span>{getLabel(menu.label)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        {event_operations.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase text-muted-foreground/70 font-bold tracking-wider mb-2 mt-4 ml-2">
              Event Control
            </SidebarGroupLabel>
            <SidebarMenu>
              {event_operations.map((menu) => {
                const normalizedPath = normalizeMenuPath(menu.path);
                const isActive =
                  pathname === normalizedPath ||
                  pathname?.startsWith(`${normalizedPath}/`);
                return (
                  <SidebarMenuItem key={menu.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={getLabel(menu.label)}
                    >
                      <Link href={normalizedPath}>
                        {getMenuIcon(menu.icon)}
                        <span>{getLabel(menu.label)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {manage_people.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase text-muted-foreground/70 font-bold tracking-wider mb-2 mt-4 ml-2">
              People
            </SidebarGroupLabel>
            <SidebarMenu>
              {manage_people.map((menu) => {
                const normalizedPath = normalizeMenuPath(menu.path);
                const isActive =
                  pathname === normalizedPath ||
                  pathname?.startsWith(`${normalizedPath}/`);
                return (
                  <SidebarMenuItem key={menu.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={getLabel(menu.label)}
                    >
                      <Link href={normalizedPath}>
                        {getMenuIcon(menu.icon)}
                        <span>{getLabel(menu.label)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {system.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase text-muted-foreground/70 font-bold tracking-wider mb-2 mt-4 ml-2">
              System
            </SidebarGroupLabel>
            <SidebarMenu>
              {system.map((menu) => {
                const normalizedPath = normalizeMenuPath(menu.path);
                const isActive =
                  pathname === normalizedPath ||
                  pathname?.startsWith(`${normalizedPath}/`);
                return (
                  <SidebarMenuItem key={menu.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={getLabel(menu.label)}
                    >
                      <Link href={normalizedPath}>
                        {getMenuIcon(menu.icon)}
                        <span>{getLabel(menu.label)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </>
    );
  };

  // Calculate user initials
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n?.[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "A"
    : "A";

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Ticket className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold">UMN FESTIVAL</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-4">
          {renderSidebarContent()}
        </SidebarContent>
        {user && (
          <SidebarFooter>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.avatar_url}
                      alt={user.name ?? "User"}
                    />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col items-start text-left text-sm">
                    <span className="font-medium">{user.name ?? "User"}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.email ?? ""}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name ?? "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email ?? ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        )}
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-6">
          <div className="flex items-center gap-4 flex-1">
            <SidebarTrigger className="-ml-1" />
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
            <LanguageToggleButton />
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
