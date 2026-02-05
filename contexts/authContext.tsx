"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type AuthUser = {
  userName: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loggedIn: boolean;
  loading: boolean;
  login: (passphrase: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
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

  // ----------------------------
  const value: AuthContextType = {
    user,
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
