"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import type { MenuWithActions } from "@/features/master-data/user-management/types";

export function useDashboardCommandPalette(options?: { menus?: MenuWithActions[] | undefined }) {
  const { menus } = options || {};
  const [isOpen, setIsOpen] = useState(false);

  // Toggle handler compatible with Dialog's onOpenChange
  const toggle = useCallback((value?: boolean) => {
    if (typeof value === "boolean") setIsOpen(value);
    else setIsOpen((s) => !s);
  }, []);

  // Flatten menus into command items
  const items = useMemo(() => {
    const out: Array<{ id: string; name: string; href?: string; icon?: string; group?: string }> = [];

    function walk(list?: MenuWithActions[], group?: string) {
      if (!list) return;
      for (const m of list) {
        out.push({ id: m.id, name: m.title || m.id, href: m.url, icon: undefined, group: group || m.title });
        if (m.children) walk(m.children, group || m.title);
      }
    }

    walk(menus);
    return out;
  }, [menus]);

  const onSelectItem = useCallback((href?: string) => {
    setIsOpen(false);
    if (href) {
      // prefer client-side navigation when available
      if (typeof window !== "undefined") window.location.assign(href);
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  return { isOpen, toggle, items, onSelectItem } as const;
}

export default useDashboardCommandPalette;
