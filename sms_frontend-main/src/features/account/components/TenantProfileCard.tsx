import { Card } from "../../../shared/ui/Card";
import { Badge } from "../../../shared/ui/Badge";
import type { Tenant, TenantStatus } from "../types/account.types";

const statusVariant: Record<TenantStatus, "success" | "warning" | "danger"> = {
  ACTIVE: "success",
  SUSPENDED: "warning",
  CLOSED: "danger",
};

export function TenantProfileCard({ tenant }: { tenant: Tenant }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{tenant.name}</h2>
          <p className="font-mono text-xs text-slate-500 mt-1">
            Tenant ID: {tenant.id}
          </p>
        </div>
        <Badge variant={statusVariant[tenant.status]}>
          {tenant.status}
        </Badge>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-slate-500">Registered date</dt>
          <dd className="mt-1 text-sm font-medium text-slate-900">
            {tenant.createdAt.slice(0, 10)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">Last profile update</dt>
          <dd className="mt-1 text-sm font-medium text-slate-900">
            {tenant.updatedAt.slice(0, 10)}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
