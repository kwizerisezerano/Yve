import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountStatus, Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AccountEntity } from './dto/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateAccountResponseDto } from './dto/create-account-response.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { generateApiKey } from './utils/api-key.util';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createAccountDto: CreateAccountDto,
  ): Promise<CreateAccountResponseDto> {
    const { rawKey, hashedKey, keyPrefix } = generateApiKey();

    try {
      const account = await this.prisma.$transaction(async (tx) => {
        const createdAccount = await tx.account.create({
          data: createAccountDto,
        });

        await tx.apiKey.create({
          data: {
            accountId: createdAccount.id,
            keyPrefix,
            hashedKey,
          },
        });

        return createdAccount;
      });

      return {
        account,
        apiKey: rawKey,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An account with this email already exists.',
        );
      }

      throw error;
    }
  }

  async findAll(): Promise<AccountEntity[]> {
    return this.prisma.account.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string): Promise<AccountEntity> {
    const account = await this.prisma.account.findUnique({ where: { id } });

    if (!account) {
      throw new NotFoundException(`Account ${id} not found.`);
    }

    return account;
  }

  async update(
    id: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<AccountEntity> {
    try {
      return await this.prisma.account.update({
        where: { id },
        data: updateAccountDto,
      });
    } catch (error) {
      throw this.translateWriteError(error, id);
    }
  }

  async updateStatus(
    id: string,
    status: AccountStatus,
  ): Promise<AccountEntity> {
    try {
      return await this.prisma.account.update({
        where: { id },
        data: { status },
      });
    } catch (error) {
      throw this.translateWriteError(error, id);
    }
  }

  softDelete(id: string): Promise<AccountEntity> {
    return this.updateStatus(id, AccountStatus.SUSPENDED);
  }

  private translateWriteError(error: unknown, id: string): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new NotFoundException(`Account ${id} not found.`);
      }

      if (error.code === 'P2002') {
        return new ConflictException(
          'An account with this email already exists.',
        );
      }
    }

    return error;
  }
}
