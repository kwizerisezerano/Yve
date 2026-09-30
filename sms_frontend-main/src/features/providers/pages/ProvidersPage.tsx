import { PageContainer } from "../../../shared/ui/PageContainer";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { Table } from "../../../shared/ui/Table";
import { TableHead } from "../../../shared/ui/TableHead";
import { TableBody } from "../../../shared/ui/TableBody";
import { TableRow } from "../../../shared/ui/TableRow";
import { TableHeaderCell } from "../../../shared/ui/TableHeaderCell";
import { TableCell } from "../../../shared/ui/TableCell";
import { Badge } from "../../../shared/ui/Badge";
import { useProviders } from "../hooks/useProviders";
import type { ProviderStatus } from "../types/provider.types";

const statusVariant: Record<ProviderStatus, "success" | "warning" | "danger"> = {
  ACTIVE: "success",
  DEGRADED: "warning",
  INACTIVE: "danger",
};

export function ProvidersPage() {
  const { data: providers, isLoading, isError } = useProviders();

  return (
    <PageContainer>
      <PageHeader
        title="Provider Catalog"
        description="Upstream telecommunication gateways and routing priorities configured in Ingoga Core."
      />

      {isLoading ? (
        <div className="flex flex-col gap-3 mt-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 w-full rounded-lg bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load the provider catalog. Please try refreshing the page.
        </div>
      ) : null}

      {!isLoading && !isError && providers ? (
        providers.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500">
            No upstream providers configured.
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Provider Name</TableHeaderCell>
                <TableHeaderCell>Code</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Priority</TableHeaderCell>
                <TableHeaderCell>Traffic Weight</TableHeaderCell>
                <TableHeaderCell>Region</TableHeaderCell>
                <TableHeaderCell>Capabilities</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {providers.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-slate-900">
                    {item.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600">
                    {item.code}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[item.status]}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700">
                    #{item.priority}
                  </TableCell>
                  <TableCell>{item.weight}%</TableCell>
                  <TableCell>{item.countryCode}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(item.supportedTypes ?? []).map((t) => (
                        <span
                          key={t}
                          className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      ) : null}
    </PageContainer>
  );
}
