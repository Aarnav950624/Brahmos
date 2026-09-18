import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole =
  | "CITIZEN"
  | "ASHA_WORKER"
  | "DOCTOR"
  | "PHARMACY"
  | "PANCHAYAT_ADMIN";

export interface DemoUser {
  id: string;
  name: string;
  role: UserRole;
  language: string;
}

interface AuthState {
  user: DemoUser | null;
  isAuthenticated: boolean;
  login: (user: DemoUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "arogyaai-auth-storage",
    }
  )
);

// Authorization Helpers
export const isCitizen = (user: DemoUser | null) => user?.role === "CITIZEN";
export const isAsha = (user: DemoUser | null) => user?.role === "ASHA_WORKER";
export const isDoctor = (user: DemoUser | null) => user?.role === "DOCTOR";
export const isPharmacy = (user: DemoUser | null) => user?.role === "PHARMACY";
export const isPanchayatAdmin = (user: DemoUser | null) => user?.role === "PANCHAYAT_ADMIN";

export const getRolePath = (role: UserRole): string => {
  switch (role) {
    case "CITIZEN": return "/citizen";
    case "ASHA_WORKER": return "/asha";
    case "DOCTOR": return "/doctor";
    case "PHARMACY": return "/pharmacy";
    case "PANCHAYAT_ADMIN": return "/panchayat";
    default: return "/";
  }
};
