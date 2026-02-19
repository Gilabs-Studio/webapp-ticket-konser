"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useLogout } from "@/features/auth/hooks/useLogout";
import {
  LogOut,
  User,
  ShoppingBag,
  Ticket,
  LayoutDashboard,
  ScanLine,
  CheckCircle2,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

interface UserMenuProps {
  readonly showHistory?: boolean;
  readonly isAdmin?: boolean;
  readonly isStaff?: boolean;
}

export function UserMenu({
  showHistory = false,
  isAdmin = false,
  isStaff = false,
}: UserMenuProps) {
  const t = useTranslations("common");
  const { user } = useAuthStore();
  const handleLogout = useLogout();

  if (!user) {
    return null;
  }

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n?.[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url} alt={user.name ?? "User"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
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
        {isAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="flex items-center">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>{t("dashboard") ?? "Dashboard"}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {isStaff && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/scanner" className="flex items-center">
                <ScanLine className="mr-2 h-4 w-4" />
                <span>{t("scanner") ?? "Scanner"}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/check-ins" className="flex items-center">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                <span>{t("checkIns") ?? "Check-ins"}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {showHistory && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/orders" className="flex items-center">
                <Ticket className="mr-2 h-4 w-4" />
                <span>{t("myTickets") ?? "My Tickets"}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/orders" className="flex items-center">
                <ShoppingBag className="mr-2 h-4 w-4" />
                <span>{t("orderHistory") ?? "Order History"}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>{t("profile") ?? "Profile"}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t("logout") ?? "Logout"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
