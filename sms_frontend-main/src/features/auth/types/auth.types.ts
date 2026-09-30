export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
  tenant: {
    id: string;
    name: string;
  };
}

export interface OnboardRequest {
  tenantName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface OnboardResponse {
  tenant: { id: string; name: string; status: string };
  user: { id: string; email: string; role: string };
  wallet: { id: string; balance: number; currency: string };
}
