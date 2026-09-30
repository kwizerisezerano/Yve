import { useState, type FormEvent } from "react";
import { Modal } from "../../../shared/ui/Modal";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { useRegisterSenderId } from "../hooks/useRegisterSenderId";

interface RegisterSenderIdModalProps {
  open: boolean;
  onClose: () => void;
}

export function RegisterSenderIdModal({
  open,
  onClose,
}: RegisterSenderIdModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const registerMutation = useRegisterSenderId();

  function handleClose() {
    setName("");
    setError("");
    onClose();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const clean = name.trim().toUpperCase();
    if (!clean) {
      setError("Sender ID is required");
      return;
    }
    if (clean.length < 3 || clean.length > 11) {
      setError("Sender ID must be between 3 and 11 characters");
      return;
    }
    setError("");
    registerMutation.mutate(
      { name: clean },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Register New Sender ID">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Sender ID (Alphanumeric)"
          placeholder="e.g. INGOGA, ACME-SMS"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error}
          maxLength={11}
        />
        <p className="text-xs text-slate-500">
          Sender IDs are submitted for approval before they can be used for live outbound SMS.
        </p>

        {registerMutation.isError ? (
          <p className="text-sm text-red-600">
            {registerMutation.error.message || "Failed to register Sender ID"}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="secondary" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? "Submitting..." : "Submit for Approval"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
