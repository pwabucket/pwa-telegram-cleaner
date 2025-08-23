import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AppStore {
  session: string | null;
  setSession: (session: string | null) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session: string | null) => set({ session }),
    }),
    {
      name: "app-store",
    }
  )
);
