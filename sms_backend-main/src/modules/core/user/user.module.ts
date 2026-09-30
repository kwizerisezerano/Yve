import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { USER_READER_PORT } from './interfaces/user-reader.port';
import { USER_REPOSITORY } from './interfaces/user-repository.interface';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { UserService } from './services/user.service';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: USER_READER_PORT, useExisting: UserService },
  ],
  exports: [USER_READER_PORT, UserService],
})
export class UserModule {}
