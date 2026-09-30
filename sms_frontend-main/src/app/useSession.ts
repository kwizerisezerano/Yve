import { getSession } from "../shared/lib/session-storage";

interface Session {
  userName: string;
  tenantName: string;
}

export function useSession(): Session {
  const session = getSession();
  return {
    userName: session?.user?.email ?? "Admin",
    tenantName: session?.tenant?.name ?? "Ingoga Demo",
  };
}
