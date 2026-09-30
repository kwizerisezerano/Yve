import { Modal } from "../../../shared/ui/Modal";
import { UserForm } from "./UserForm";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateUserModal({ open, onClose }: CreateUserModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Add a user">
      <UserForm onSuccess={onClose} />
    </Modal>
  );
}
