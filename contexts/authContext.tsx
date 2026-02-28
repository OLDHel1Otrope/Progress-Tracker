"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type HomeItem = {
  id: "goals" | "day_counter" | "timer" | "stats";
  position: number;
  active: boolean;
};


type AuthUser = {
  userName: string;
  focus_mode: boolean;
  carry_over: boolean;
  zestify_mode: boolean;
  auto_place: boolean;
  target_date: string;
  home_order: HomeItem[];
};

type AuthContextType = {
  user: AuthUser | null;
  loggedIn: boolean;
  loading: boolean;
  login: (passphrase: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateUserDetails: (data: {
    focus_mode?: boolean;
    carry_over?: boolean;
    zestify_mode?: boolean;
    auto_place?: boolean;
    target_date?: string;
    home_order?: HomeItem[];
  }) => Promise<void>
};

const AuthContext = createContext<AuthContextType | null>(null);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refresh();
  }, []);


  async function refresh() {
    try {
      setLoading(true);

      const res = await fetch("/api/me", {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();

      setUser({
        userName: data.userName,
        focus_mode: data.focus_mode,
        carry_over: data.carry_over,
        zestify_mode: data.zestify_mode,
        auto_place: data.auto_place,
        target_date: data.target_date,
        home_order: data.home_order
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }


  async function login(passphrase: string) {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ passphrase }),
      });

      if (!res.ok) return false;

      await refresh();
      return true;
    } catch {
      return false;
    }
  }


  async function logout() {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
  }

  async function updateUserDetails(
    data: {
      focus_mode?: boolean;
      carry_over?: boolean;
      zestify_mode?: boolean;
      auto_place?: boolean;
      target_date?: string;
      home_order?: HomeItem[];
    }
  ) {
    if (!user) return;

    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => typeof v !== undefined)
    );

    if (Object.keys(payload).length === 0) return;

    try {
      setUser((prev) =>
        prev ? { ...prev, ...payload } : prev
      );

      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        await refresh();
        throw new Error("Failed to update user details");
      }

      const updated = await res.json();

      setUser((prev) =>
        prev ? { ...prev, ...updated } : prev
      );
    } catch (err) {
      console.error("updateUserDetails failed", err);
    }
  }


  const value: AuthContextType = {
    user,
    updateUserDetails,
    loggedIn: !!user,
    loading,
    login,
    logout,
    refresh,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
}
