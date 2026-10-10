import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Welcome from "./pages/Welcome";
import Legal from "./pages/Legal";
import Studio from "./pages/app/Studio";
import Library from "./pages/app/Library";
import Settings from "./pages/app/Settings";
import AppLayout from "./components/layout/AppLayout";
import { GuestRoute, ProtectedRoute } from "./components/layout/ProtectedRoute";

const TITLES = {
  "/": "Squish — Squish your files. Not your pixels.",
  "/login": "Log in · Squish",
  "/register": "Sign up · Squish",
  "/welcome": "Welcome · Squish",
  "/app": "Studio · Squish",
  "/app/library": "Library · Squish",
  "/app/settings": "Settings · Squish",
};

function RouteEffects() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    document.title = TITLES[pathname] || "Squish";
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <RouteEffects />
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* outside both guards: it publishes the user itself, then hands off to the studio */}
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/privacy" element={<Legal />} />
        <Route path="/terms" element={<Legal />} />
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Studio />} />
            <Route path="library" element={<Library />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
