import { User } from '../entities/user.entity';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface UserRepository {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(tenantId: string, email: string): Promise<User | null>;
  findByEmailGlobally(email: string): Promise<User | null>;
  findAllByTenant(tenantId: string): Promise<User[]>;
  save(user: User): Promise<User>;
}
