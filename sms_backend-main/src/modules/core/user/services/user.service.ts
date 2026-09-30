import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EntityNotFoundException } from '../../../../shared/common/exceptions/entity-not-found.exception';
import { StateConflictException } from '../../../../shared/common/exceptions/state-conflict.exception';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { USER_REPOSITORY, UserRepository } from '../interfaces/user-repository.interface';
import { UserReaderPort, UserSummary } from '../interfaces/user-reader.port';

@Injectable()
export class UserService implements UserReaderPort {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

  async create(tenantId: string, email: string, password: string, role: UserRole): Promise<User> {
    const existing = await this.userRepository.findByEmail(tenantId, email);
    if (existing) {
      throw new StateConflictException(`User with email ${email} already exists in this tenant`);
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = User.create(tenantId, email, passwordHash, role);
    return this.userRepository.create(user);
  }

  async getById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new EntityNotFoundException('User', id);
    return user;
  }

  async listByTenant(tenantId: string): Promise<User[]> {
    return this.userRepository.findAllByTenant(tenantId);
  }

  async lock(id: string): Promise<User> {
    const user = await this.getById(id);
    user.lock();
    return this.userRepository.save(user);
  }

  async activate(id: string): Promise<User> {
    const user = await this.getById(id);
    user.activate();
    return this.userRepository.save(user);
  }

  // UserReaderPort
  async findById(id: string): Promise<UserSummary | null> {
    const user = await this.userRepository.findById(id);
    return user ? this.toSummary(user) : null;
  }

  async findByEmail(tenantId: string, email: string): Promise<UserSummary | null> {
    const user = await this.userRepository.findByEmail(tenantId, email);
    return user ? this.toSummary(user) : null;
  }

  async findByEmailGlobally(email: string): Promise<UserSummary | null> {
    const user = await this.userRepository.findByEmailGlobally(email);
    return user ? this.toSummary(user) : null;
  }

  private toSummary(user: User): UserSummary {
    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
      status: user.status,
      passwordHash: user.passwordHash,
    };
  }
}
