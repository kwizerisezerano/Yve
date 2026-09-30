import { PageContainer } from "../../../shared/ui/PageContainer";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { useTenant } from "../hooks/useTenant";
import { TenantProfileCard } from "../components/TenantProfileCard";

export function AccountPage() {
  const tenantQuery = useTenant();

  return (
    <PageContainer>
      <PageHeader
        title="Account"
        description="Your organisation details and status."
      />

      {tenantQuery.isLoading ? (
        <p className="text-sm text-slate-500">Loading account...</p>
      ) : null}

      {tenantQuery.isError ? (
        <p className="text-sm text-red-600">
          Could not load your account. Please try again.
        </p>
      ) : null}

      {tenantQuery.isSuccess ? (
        <TenantProfileCard tenant={tenantQuery.data} />
      ) : null}
    </PageContainer>
  );
}
