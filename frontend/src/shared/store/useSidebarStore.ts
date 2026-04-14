import { create } from "zustand";
import { persist } from "zustand/middleware";

interface sideBarStore {
  collapsed: boolean;
  setCollapsed: () => void;
}

export const useSideBarStore = create<sideBarStore>()(
  persist(
    (set) => ({
      collapsed: false,
      setCollapsed: () => {
        set((state) => ({ collapsed: !state.collapsed }));
      },
    }),
    {
      name: "sidebar-storage", // nombre en localStorage
    },
  ),
);
