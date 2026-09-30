import { useState } from "react";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { Table } from "../../../shared/ui/Table";
import { TableHead } from "../../../shared/ui/TableHead";
import { TableBody } from "../../../shared/ui/TableBody";
import { TableRow } from "../../../shared/ui/TableRow";
import { TableHeaderCell } from "../../../shared/ui/TableHeaderCell";
import { TableCell } from "../../../shared/ui/TableCell";
import { Badge } from "../../../shared/ui/Badge";
import { Button } from "../../../shared/ui/Button";
import { useSenderIds } from "../hooks/useSenderIds";
import { RegisterSenderIdModal } from "../components/RegisterSenderIdModal";
import type { SenderIdStatus } from "../types/sender-id.types";

const statusVariant: Record<SenderIdStatus, "success" | "warning" | "danger"> = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "danger",
};

const statusNote: Record<SenderIdStatus, string> = {
  PENDING: "Pending Super Admin approval",
  APPROVED: "Approved & active for SMS campaigns",
  REJECTED: "Rejected by Super Admin",
};

export function SenderIdsPage() {
  const { data: senderIds, isLoading, isError } = useSenderIds();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <PageContainer>
      <PageHeader
        title="Sender IDs"
        description="Register and manage custom alphanumeric sender headers for your SMS campaigns."
        actions={
          <Button onClick={() => setIsRegisterOpen(true)}>
            Register Sender ID
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading Sender IDs...</p>
      ) : null}

      {isError ? (
        <p className="text-sm text-red-600">Failed to load Sender IDs.</p>
      ) : null}

      {senderIds ? (
        senderIds.length === 0 ? (
          <div className="rounded-md border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No Sender IDs registered yet. Click &quot;Register Sender ID&quot; to request one.
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Sender ID</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Registered Date</TableHeaderCell>
                <TableHeaderCell>Last Updated</TableHeaderCell>
                <TableHeaderCell>Governance Note</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {senderIds.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono font-bold text-slate-900">
                    {item.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[item.status]}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.createdAt.slice(0, 10)}</TableCell>
                  <TableCell>{item.updatedAt.slice(0, 10)}</TableCell>
                  <TableCell className="text-xs font-medium text-slate-500">
                    {statusNote[item.status]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      ) : null}

      <RegisterSenderIdModal
        open={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
    </PageContainer>
  );
}
