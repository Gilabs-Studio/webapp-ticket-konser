"use client";

import { create } from "zustand";
import type { Menu } from "../types";

interface MenuStore {
  menus: Menu[];
  setMenus: (menus: Menu[]) => void;
  addMenu: (menu: Menu) => void;
  updateMenu: (id: string, menu: Partial<Menu>) => void;
  removeMenu: (id: string) => void;
  clearMenus: () => void;
}

export const useMenuStore = create<MenuStore>((set) => ({
  menus: [],

  setMenus: (menus: Menu[]) => {
    set({ menus });
  },

  addMenu: (menu: Menu) => {
    set((state) => ({
      menus: [...state.menus, menu],
    }));
  },

  updateMenu: (id: string, menu: Partial<Menu>) => {
    set((state) => ({
      menus: state.menus.map((m) => (m.id === id ? { ...m, ...menu } : m)),
    }));
  },

  removeMenu: (id: string) => {
    set((state) => ({
      menus: state.menus.filter((m) => m.id !== id),
    }));
  },

  clearMenus: () => {
    set({ menus: [] });
  },
}));


