import { useState } from "react";
import { useLocation } from "react-router";
import { AnnouncementBar } from "./AnnouncementBar";
import { PublicNavbar } from "../../shared/components/PublicNavbar";
import { PublicFooter } from "../../shared/components/PublicFooter";
import { Hero } from "./Hero";
import { ProductsSection } from "./ProductsSection";
import { IntegrationSection } from "./IntegrationSection";
import { ResourcesSection } from "./ResourcesSection";
import { PricingSection } from "./PricingSection";
import {
  AuthModal,
  type AuthMode,
} from "../../features/auth/components/AuthModal";

interface LandingLocationState {
  openLogin?: boolean;
}

export function LandingPage() {
  const location = useLocation();
  const state = location.state as LandingLocationState | null;
  const [authOpen, setAuthOpen] = useState(Boolean(state?.openLogin));
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  function openAuth(mode: AuthMode) {
    setAuthMode(mode);
    setAuthOpen(true);
  }

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <AnnouncementBar />
      <PublicNavbar
        onLoginClick={() => openAuth("login")}
        onSignupClick={() => openAuth("signup")}
      />
      <Hero onTryForFreeClick={() => openAuth("signup")} />
      <ProductsSection onGetStarted={() => openAuth("signup")} />
      <IntegrationSection onGetStarted={() => openAuth("signup")} />
      <ResourcesSection onGetStarted={() => openAuth("signup")} />
      <PricingSection onGetStarted={() => openAuth("signup")} />
      <PublicFooter />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
