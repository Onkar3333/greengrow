import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { JWTPayload } from "./auth";

const TOKEN_KEY = "gg_token";

interface AuthCtx {
  token:    string | null;
  user:     JWTPayload | null;
  setToken: (t: string | null) => void;
  logout:   () => void;
  isLogged: boolean;
  isFarmer:   boolean;
  isSupplier: boolean;
}

const Ctx = createContext<AuthCtx | null>(null);

// ── Decode JWT payload client-side (no signature check needed — server validates) ──
function decodePayload(token: string): JWTPayload | null {
  try {
    const part = token.split(".")[1];
    return JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/"))) as JWTPayload;
  } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  });

  const user = token ? decodePayload(token) : null;

  function setToken(t: string | null) {
    setTokenState(t);
    try {
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else    localStorage.removeItem(TOKEN_KEY);
    } catch { /**/ }
  }

  function logout() { setToken(null); }

  const value: AuthCtx = {
    token, user, setToken, logout,
    isLogged:   !!user && user.exp > Date.now() / 1000,
    isFarmer:   user?.role === "farmer",
    isSupplier: user?.role === "supplier",
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

export function getStoredToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
