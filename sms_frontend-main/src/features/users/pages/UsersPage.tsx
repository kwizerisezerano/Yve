import { useState } from "react";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { Button } from "../../../shared/ui/Button";
import { useUsers } from "../hooks/useUsers";
import { UsersTable } from "../components/UsersTable";
import { CreateUserModal } from "../components/CreateUserModal";

export function UsersPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const usersQuery = useUsers();

  return (
    <PageContainer>
      <PageHeader
        title="Users"
        description="Manage who can sign in to this portal."
        actions={<Button onClick={() => setCreateOpen(true)}>New user</Button>}
      />

      {usersQuery.isLoading ? (
        <p className="text-sm text-slate-500">Loading users...</p>
      ) : null}

      {usersQuery.isError ? (
        <p className="text-sm text-red-600">
          Could not load users. Please try again.
        </p>
      ) : null}

      {usersQuery.isSuccess ? <UsersTable users={usersQuery.data} /> : null}

      <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </PageContainer>
  );
}
