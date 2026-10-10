import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  // where to send someone whose session just ended on purpose (log out, account deleted).
  // The route guard reads it, so the redirect happens in the same render as the sign-out
  // instead of racing a separate navigate() call (which React Router runs at low priority).
  const [exitTo, setExitTo] = useState(null);

  const setUser = useCallback((next) => {
    if (next) setExitTo(null);
    setUserState(next);
  }, []);

  /** Clear the session and land on `to` (home by default). */
  const signOut = useCallback((to = "/") => {
    setExitTo(to);
    setUserState(null);
  }, []);

  // once they've actually left the app, forget it — so pressing Back into /app later
  // asks them to log in rather than bouncing home again
  const { pathname } = useLocation();
  useEffect(() => {
    if (exitTo && !pathname.startsWith("/app")) setExitTo(null);
  }, [exitTo, pathname]);

  useEffect(() => {
    api
      .me()
      .then(setUserState)
      .catch(() => setUserState(null))
      .finally(() => setLoading(false));

    // if the browser restores this page from its back/forward cache (e.g. Back after
    // logging out on a shared computer), re-check the session instead of trusting the snapshot
    const onPageShow = (e) => {
      if (e.persisted) api.me().then(setUserState).catch(() => setUserState(null));
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  // Authenticates (cookies are set) but doesn't publish the user yet: the welcome
  // screen does that, so the guest-only /login route can't redirect away mid-transition.
  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    return data.user;
  }, []);

  // Creates the account only — the user then logs in themselves.
  const register = useCallback((form) => api.register(form), []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      signOut("/");
    }
  }, [signOut]);

  const value = useMemo(
    () => ({ user, setUser, loading, login, register, logout, signOut, exitTo }),
    [user, setUser, loading, login, register, logout, signOut, exitTo]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
