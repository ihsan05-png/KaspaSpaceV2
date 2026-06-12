import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { apiFetch, ApiError } from '../lib/api';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<AuthUser>;
  register: (name: string, email: string, phone: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const INACTIVITY_MS = 30 * 60 * 1000; // 30 menit tanpa aktivitas → logout

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---- Inactivity auto-logout ---- */
  const scheduleLogout = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(async () => {
      try { await apiFetch('/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
      setUser(null);
    }, INACTIVITY_MS);
  }, []);

  const resetTimer = useCallback(() => {
    if (user) scheduleLogout();
  }, [user, scheduleLogout]);

  /* Track user activity events */
  useEffect(() => {
    if (!user) {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      return;
    }
    scheduleLogout();
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [user, scheduleLogout, resetTimer]);

  /* ---- Visibility change — detect tab hidden / minimize ---- */
  useEffect(() => {
    const handleVisibility = () => {
      if (!user) return;
      if (document.hidden) {
        /* Tab tersembunyi — mulai countdown agresif (tetap 30 mnt) */
        scheduleLogout();
      } else {
        /* Tab kembali aktif — verifikasi sesi ke server */
        apiFetch<{ user: AuthUser | null }>('/auth/user')
          .then(data => {
            if (!data.user) { setUser(null); }
          })
          .catch(() => { setUser(null); });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [user, scheduleLogout]);

  /* ---- Load user on mount ---- */
  useEffect(() => {
    apiFetch<{ user: AuthUser | null }>('/auth/user')
      .then(data => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  /* ---- Auth actions ---- */
  const login = async (email: string, password: string, remember: boolean): Promise<AuthUser> => {
    const data = await apiFetch<{ user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, remember }),
    });
    setUser(data.user);
    return data.user;
  };

  const register = async (name: string, email: string, phone: string, password: string): Promise<AuthUser> => {
    const data = await apiFetch<{ user: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password }),
    });
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try { await apiFetch('/auth/logout', { method: 'POST' }); } catch { /* ignore network error */ }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { ApiError };
