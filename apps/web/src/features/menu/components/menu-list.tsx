"use client";

import { useMenus } from "../hooks/useMenus";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MenuListProps {
  readonly onMenuClick?: (menu: { id: string; path?: string }) => void;
}

export function MenuList({ onMenuClick }: MenuListProps) {
  const { data, isLoading, isError, error } = useMenus();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load menus"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const menus = data ?? [];

  if (menus.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">No menus available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {menus.map((menu) => (
        <Card
          key={menu.id}
          className="cursor-pointer hover:bg-accent transition-colors"
          onClick={() => onMenuClick?.({ id: menu.id, path: menu.path })}
        >
          <CardHeader>
            <CardTitle className="text-base">{menu.label}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}


