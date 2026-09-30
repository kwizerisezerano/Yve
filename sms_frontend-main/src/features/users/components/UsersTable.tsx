import { Table } from "../../../shared/ui/Table";
import { TableHead } from "../../../shared/ui/TableHead";
import { TableBody } from "../../../shared/ui/TableBody";
import { TableRow } from "../../../shared/ui/TableRow";
import { TableHeaderCell } from "../../../shared/ui/TableHeaderCell";
import { TableCell } from "../../../shared/ui/TableCell";
import { Badge } from "../../../shared/ui/Badge";
import { Button } from "../../../shared/ui/Button";
import { useUpdateUserStatus } from "../hooks/useUpdateUserStatus";
import type { User, UserRole } from "../types/users.types";

const roleLabel: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  DEVELOPER: "Developer",
  VIEWER: "Viewer",
};

export function UsersTable({ users }: { users: User[] }) {
  const updateStatus = useUpdateUserStatus();

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Email</TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Created</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium text-slate-900">
              {user.email}
            </TableCell>
            <TableCell>{roleLabel[user.role] ?? user.role}</TableCell>
            <TableCell>
              <Badge variant={user.status === "ACTIVE" ? "success" : "danger"}>
                {user.status}
              </Badge>
            </TableCell>
            <TableCell>{user.createdAt.slice(0, 10)}</TableCell>
            <TableCell>
              <Button
                variant="secondary"
                size="sm"
                disabled={updateStatus.isPending}
                onClick={() =>
                  updateStatus.mutate({
                    id: user.id,
                    status: user.status === "ACTIVE" ? "LOCKED" : "ACTIVE",
                  })
                }
              >
                {user.status === "ACTIVE" ? "Lock" : "Activate"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
