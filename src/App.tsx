import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import GalleryPage from "./pages/GalleryPage";
import RsvpPage from "./pages/RsvpPage";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";
import PrivacyPage from "./pages/PrivacyPage";
import CookiePage from "./pages/CookiePage";
import TerminiPage from "./pages/TerminiPage";
import EventRedirectPage from "./pages/EventRedirectPage";
import { supabase } from "./lib/supabase";

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabase) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        navigate("/update-password", { replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/update-password" element={<UpdatePasswordPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/cookie" element={<CookiePage />} />
      <Route path="/termini" element={<TerminiPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<DashboardPage />} />
      </Route>
      <Route path="/:publicId/gallery" element={<GalleryPage />} />
      <Route path="/:publicId/rsvp" element={<RsvpPage />} />
      <Route path="/e/:eventId" element={<EventRedirectPage />} />
      <Route path="/e/:eventId/rsvp" element={<EventRedirectPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
