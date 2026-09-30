import { useState, type FormEvent } from "react";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { ApiError } from "../../../shared/api/api-error";
import { useLogin } from "../hooks/useLogin";

interface FormErrors {
  email?: string;
  password?: string;
}

function validate(email: string, password: string): FormErrors {
  const errors: FormErrors = {};
  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email";
  }
  if (!password) {
    errors.password = "Password is required";
  }
  return errors;
}

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const loginMutation = useLogin();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validate(email, password);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    loginMutation.mutate({ email, password });
  }

  const serverError = loginMutation.isError
    ? loginMutation.error instanceof ApiError
      ? loginMutation.error.message
      : "Something went wrong. Please try again."
    : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
        autoComplete="email"
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        autoComplete="current-password"
      />
      {serverError ? (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      ) : null}
      <Button type="submit" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? "Signing in..." : "Sign in"}
      </Button>
      <p className="text-center text-sm text-slate-500">
        New organisation?{" "}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="font-medium text-[rgba(200,16,46)] hover:text-[rgba(180,14,41)] hover:underline"
        >
          Create account
        </button>
      </p>
    </form>
  );
}
