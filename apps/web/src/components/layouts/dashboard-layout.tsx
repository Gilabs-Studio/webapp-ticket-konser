"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useMenus } from "@/features/menu/hooks/useMenus";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Menu as MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Menu } from "@/features/menu/types";

interface DashboardLayoutProps {
  readonly children: React.ReactNode;
}

function MenuItem({ menu, isActive, onClick }: { menu: Menu; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {menu.icon && <span className="text-lg">{menu.icon}</span>}
      <span className="text-sm font-medium">{menu.label}</span>
    </button>
  );
}

function MenuList({ menus, pathname, onNavigate }: { menus: Menu[]; pathname: string; onNavigate: (path: string) => void }) {
  const findActiveMenu = (menuList: Menu[]): Menu | null => {
    for (const menu of menuList) {
      const menuPath = menu.path === "/" ? "/dashboard" : menu.path;
      if (menuPath && pathname === menuPath) {
        return menu;
      }
      if (menu.children) {
        const found = findActiveMenu(menu.children);
        if (found) return found;
      }
    }
    return null;
  };

  const activeMenu = findActiveMenu(menus);

  const renderMenu = (menu: Menu) => {
    const menuPath = menu.path === "/" ? "/dashboard" : menu.path;
    const isActive = menuPath && pathname === menuPath;
    const hasChildren = menu.children && menu.children.length > 0;

    return (
      <div key={menu.id}>
        <MenuItem
          menu={menu}
          isActive={isActive}
          onClick={() => {
            if (menuPath) {
              onNavigate(menuPath);
            }
          }}
        />
        {hasChildren && (
          <div className="ml-4 mt-1 space-y-1">
            {menu.children?.map((child) => renderMenu(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {menus.map((menu) => renderMenu(menu))}
    </div>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { data: menus, isLoading: isLoadingMenus } = useMenus();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="h-full flex flex-col">
          {/* Logo/Brand */}
          <div className="h-16 border-b flex items-center px-4">
            <div className="flex items-center gap-2">
              <MenuIcon className="h-6 w-6" />
              <h1 className="text-xl font-bold">Ticket Konser</h1>
            </div>
          </div>

          {/* Menu List */}
          <nav className="flex-1 overflow-y-auto p-4">
            {isLoadingMenus ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <MenuList
                menus={menus ?? []}
                pathname={pathname}
                onNavigate={handleNavigate}
              />
            )}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b bg-card">
          <div className="h-full flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">
                {(() => {
                  const findMenuByPath = (menuList: Menu[]): Menu | null => {
                    for (const menu of menuList) {
                      const menuPath = menu.path === "/" ? "/dashboard" : menu.path;
                      if (menuPath && pathname === menuPath) {
                        return menu;
                      }
                      if (menu.children) {
                        const found = findMenuByPath(menu.children);
                        if (found) return found;
                      }
                    }
                    return null;
                  };
                  return findMenuByPath(menus ?? [])?.label ?? "Dashboard";
                })()}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.name ?? "User"}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

