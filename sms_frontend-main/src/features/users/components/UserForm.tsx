import { useState, type FormEvent } from "react";
import { Input } from "../../../shared/ui/Input";
import { Select } from "../../../shared/ui/Select";
import { Button } from "../../../shared/ui/Button";
import { useCreateUser } from "../hooks/useCreateUser";
import type { UserRole } from "../types/users.types";

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
    errors.password = "Initial password is required";
  } else if (password.length < 8) {
    errors.password = "Use at least 8 characters";
  }
  return errors;
}

interface UserFormProps {
  onSuccess: () => void;
  tenantId?: string;
}

export function UserForm({ onSuccess, tenantId }: UserFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("ADMIN");
  const [errors, setErrors] = useState<FormErrors>({});
  const createUser = useCreateUser();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validate(email, password);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    createUser.mutate({ email, password, role, tenantId }, { onSuccess });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
        autoComplete="new-email"
      />
      <Input
        label="Initial Password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        autoComplete="new-password"
      />
      <Select
        label="Role"
        value={role}
        onChange={(event) => setRole(event.target.value as UserRole)}
      >
        <option value="ADMIN">Admin</option>
        <option value="DEVELOPER">Developer</option>
        <option value="VIEWER">Viewer</option>
      </Select>
      {createUser.isError ? (
        <p role="alert" className="text-sm text-red-600">
          Could not create the user. Please check the details and try again.
        </p>
      ) : null}
      <Button type="submit" disabled={createUser.isPending}>
        {createUser.isPending ? "Creating..." : "Create user"}
      </Button>
    </form>
  );
}
