import { useState } from "react";
import { Modal } from "../../../shared/ui/Modal";
import { LoginForm } from "./LoginForm";
import { OnboardForm } from "./SignupForm";

export type AuthMode = "login" | "signup";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export function AuthModal({
  open,
  onClose,
  initialMode = "login",
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setMode(initialMode);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "login" ? "Sign in to Ingoga" : "Create organisation"}
    >
      {mode === "login" ? (
        <LoginForm onSwitchToSignup={() => setMode("signup")} />
      ) : (
        <OnboardForm onSwitchToLogin={() => setMode("login")} />
      )}
    </Modal>
  );
}
