import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase, supabaseConfigError } from "../lib/supabase";

interface AuthContextValue {
  loading: boolean;
  session: Session | null;
  user: User | null;
  configError: string | null;
  signOut: () => Promise<void>;
  // Fase 15: impersonazione admin
  impersonatedUserId: string | null;
  impersonatedEmail: string | null;
  startImpersonation: (userId: string, email: string) => void;
  stopImpersonation: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(null);
  const [impersonatedEmail, setImpersonatedEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        console.error("[auth] session bootstrap error", error);
      }
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        loading,
        session,
        user,
        configError: supabaseConfigError,
        signOut: async () => {
          if (!supabase) return;
          setImpersonatedUserId(null);
          setImpersonatedEmail(null);
          await supabase.auth.signOut();
        },
        impersonatedUserId,
        impersonatedEmail,
        startImpersonation: (userId: string, email: string) => {
          setImpersonatedUserId(userId);
          setImpersonatedEmail(email);
        },
        stopImpersonation: () => {
          setImpersonatedUserId(null);
          setImpersonatedEmail(null);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve essere usato dentro AuthProvider");
  }
  return context;
}
