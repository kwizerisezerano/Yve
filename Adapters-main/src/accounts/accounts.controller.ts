import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AccountEntity } from './dto/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateAccountResponseDto } from './dto/create-account-response.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UpdateAccountStatusDto } from './dto/update-account-status.dto';
import { AdminGuard } from './guards/admin.guard';
import { AccountsService } from './accounts.service';

@ApiTags('accounts')
@ApiSecurity('admin-key')
@UseGuards(AdminGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new account and issue its API key' })
  @ApiCreatedResponse({
    description: 'Account created. The API key is returned only once.',
    type: CreateAccountResponseDto,
  })
  @ApiConflictResponse({
    description: 'An account with this email already exists.',
  })
  @ApiBadRequestResponse({ description: 'Validation failed.' })
  create(
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<CreateAccountResponseDto> {
    return this.accountsService.create(createAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all accounts' })
  @ApiOkResponse({ description: 'List of accounts.', type: [AccountEntity] })
  findAll(): Promise<AccountEntity[]> {
    return this.accountsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an account by id' })
  @ApiParam({ name: 'id', description: 'Account UUID' })
  @ApiOkResponse({ description: 'Account found.', type: AccountEntity })
  @ApiNotFoundResponse({ description: 'No account with this id.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AccountEntity> {
    return this.accountsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update account name and/or email' })
  @ApiParam({ name: 'id', description: 'Account UUID' })
  @ApiOkResponse({ description: 'Account updated.', type: AccountEntity })
  @ApiNotFoundResponse({ description: 'No account with this id.' })
  @ApiConflictResponse({
    description: 'An account with this email already exists.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<AccountEntity> {
    return this.accountsService.update(id, updateAccountDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Activate or suspend an account' })
  @ApiParam({ name: 'id', description: 'Account UUID' })
  @ApiOkResponse({
    description: 'Account status updated.',
    type: AccountEntity,
  })
  @ApiNotFoundResponse({ description: 'No account with this id.' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAccountStatusDto: UpdateAccountStatusDto,
  ): Promise<AccountEntity> {
    return this.accountsService.updateStatus(id, updateAccountStatusDto.status);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Soft-delete an account (suspends it permanently)',
  })
  @ApiParam({ name: 'id', description: 'Account UUID' })
  @ApiOkResponse({ description: 'Account suspended.', type: AccountEntity })
  @ApiNotFoundResponse({ description: 'No account with this id.' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<AccountEntity> {
    return this.accountsService.softDelete(id);
  }
}
