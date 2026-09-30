export interface JwtPayload {
  sub: string;      // userId
  tenantId: string;
  email: string;
  role: string;
}
