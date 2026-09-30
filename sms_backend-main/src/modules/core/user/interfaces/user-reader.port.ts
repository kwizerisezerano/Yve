import { User, UserRole, UserStatus } from '../entities/user.entity';

export const USER_READER_PORT = 'USER_READER_PORT';

export interface UserSummary {
  id: string;
  tenantId: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  passwordHash: string;
}

export interface UserReaderPort {
  findById(id: string): Promise<UserSummary | null>;
  findByEmail(tenantId: string, email: string): Promise<UserSummary | null>;
  findByEmailGlobally(email: string): Promise<UserSummary | null>;
}
