import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { TenantContext } from '../../../core/auth/decorators/tenant-context.decorator';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UserService } from '../services/user.service';

@ApiTags('users')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a portal user' })
  async create(@TenantContext() tenantId: string, @Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const targetTenantId = dto.tenantId || tenantId;
    const user = await this.userService.create(targetTenantId, dto.email, dto.password, dto.role);
    return this.toResponse(user);
  }

  @Get()
  @ApiOperation({ summary: 'List portal users for current tenant' })
  async list(@TenantContext() tenantId: string): Promise<UserResponseDto[]> {
    const users = await this.userService.listByTenant(tenantId);
    return users.map((u) => this.toResponse(u));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  async getById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userService.getById(id);
    return this.toResponse(user);
  }

  private toResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };
  }
}
