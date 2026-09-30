import { useState, type FormEvent } from "react";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { useToast } from "../../../shared/ui/useToast";
import { ApiError } from "../../../shared/api/api-error";
import { useOnboard } from "../hooks/useOnboard";

interface FormValues {
  tenantName: string;
  adminEmail: string;
  adminPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  tenantName?: string;
  adminEmail?: string;
  adminPassword?: string;
  confirmPassword?: string;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.tenantName.trim()) {
    errors.tenantName = "Organisation name is required";
  }
  if (!values.adminEmail.trim()) {
    errors.adminEmail = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.adminEmail)) {
    errors.adminEmail = "Enter a valid email";
  }
  if (!values.adminPassword) {
    errors.adminPassword = "Password is required";
  } else if (values.adminPassword.length < 8) {
    errors.adminPassword = "Use at least 8 characters";
  }
  if (values.confirmPassword !== values.adminPassword) {
    errors.confirmPassword = "Passwords do not match";
  }
  return errors;
}

interface OnboardFormProps {
  onSwitchToLogin: () => void;
}

export function OnboardForm({ onSwitchToLogin }: OnboardFormProps) {
  const [tenantName, setTenantName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const onboardMutation = useOnboard();
  const { showToast } = useToast();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = { tenantName, adminEmail, adminPassword, confirmPassword };
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    onboardMutation.mutate(
      { tenantName, adminEmail, adminPassword },
      {
        onSuccess: () => {
          showToast({
            title: "Organisation created successfully! Please sign in with your email and password.",
            variant: "success",
          });
          onSwitchToLogin();
        },
      },
    );
  }

  const serverError = onboardMutation.isError
    ? onboardMutation.error instanceof ApiError
      ? onboardMutation.error.message
      : "Something went wrong. Please try again."
    : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Organisation name"
        value={tenantName}
        onChange={(event) => setTenantName(event.target.value)}
        error={errors.tenantName}
      />
      <Input
        label="Admin email"
        type="email"
        value={adminEmail}
        onChange={(event) => setAdminEmail(event.target.value)}
        error={errors.adminEmail}
        autoComplete="email"
      />
      <Input
        label="Password"
        type="password"
        value={adminPassword}
        onChange={(event) => setAdminPassword(event.target.value)}
        error={errors.adminPassword}
        autoComplete="new-password"
      />
      <Input
        label="Confirm password"
        type="password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />
      {serverError ? (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      ) : null}
      <Button type="submit" disabled={onboardMutation.isPending}>
        {onboardMutation.isPending ? "Creating organisation..." : "Create organisation"}
      </Button>
      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-medium text-[rgba(200,16,46)] hover:text-[rgba(180,14,41)] hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
