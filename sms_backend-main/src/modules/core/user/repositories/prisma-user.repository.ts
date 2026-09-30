import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import type { User as UserRecord } from '@prisma/client';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { UserRepository } from '../interfaces/user-repository.interface';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User): Promise<User> {
    const record = await this.prisma.user.create({
      data: {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        status: user.status,
      },
    });
    return this.toDomain(record);
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByEmail(tenantId: string, email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { tenantId_email: { tenantId, email } } });
    return record ? this.toDomain(record) : null;
  }

  async findByEmailGlobally(email: string): Promise<User | null> {
    const record = await this.prisma.user.findFirst({
      where: { email },
      orderBy: { createdAt: 'asc' },
    });
    return record ? this.toDomain(record) : null;
  }

  async findAllByTenant(tenantId: string): Promise<User[]> {
    const records = await this.prisma.user.findMany({ where: { tenantId }, orderBy: { createdAt: 'asc' } });
    return records.map((r) => this.toDomain(r));
  }

  async save(user: User): Promise<User> {
    const record = await this.prisma.user.update({
      where: { id: user.id },
      data: { role: user.role, status: user.status },
    });
    return this.toDomain(record);
  }

  private toDomain(record: UserRecord): User {
    return User.restore({
      id: record.id,
      tenantId: record.tenantId,
      email: record.email,
      passwordHash: record.passwordHash,
      role: record.role as UserRole,
      status: record.status as UserStatus,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
