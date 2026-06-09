import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "cidadao" | "motorista" | "administrador";

interface AuthState {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  refreshRole: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRole = useCallback(async (uid: string | undefined) => {
    if (!uid) {
      setRole(null);
      return;
    }
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid);
    if (!data || data.length === 0) {
      setRole("cidadao");
      return;
    }
    const ranked = data
      .map((r) => r.role as AppRole)
      .sort((a, b) => {
        const order = { administrador: 1, motorista: 2, cidadao: 3 } as const;
        return order[a] - order[b];
      });
    setRole(ranked[0]);
  }, []);

  useEffect(() => {
    // Subscribe FIRST, then fetch existing session
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      // Defer Supabase calls inside the callback
      if (newSession?.user) {
        setTimeout(() => { void loadRole(newSession.user.id); }, 0);
      } else {
        setRole(null);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) void loadRole(data.session.user.id);
      setLoading(false);
    });

    return () => { sub.subscription.unsubscribe(); };
  }, [loadRole]);

  const refreshRole = useCallback(async () => {
    await loadRole(user?.id);
  }, [user?.id, loadRole]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRole(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, role, loading, refreshRole, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function roleHomePath(role: AppRole | null): string {
  if (role === "administrador") return "/admin";
  if (role === "motorista") return "/motorista";
  return "/painel";
}
