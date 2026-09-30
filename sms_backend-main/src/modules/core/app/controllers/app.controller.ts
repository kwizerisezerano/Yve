import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantContext } from '../../auth/decorators/tenant-context.decorator';
import { AppService } from '../services/app.service';
import { MessagingService } from '../../messaging/services/messaging.service';
import { CreateAppDto } from '../dtos/create-app.dto';
import { UpdateAppDto } from '../dtos/update-app.dto';
import { AppResponseDto } from '../dtos/app-response.dto';

@ApiTags('Apps')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('apps')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly messagingService: MessagingService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new app',
    description: 'Creates a new application under the current tenant. Apps are used to organize API keys and track message usage.',
  })
  @ApiResponse({
    status: 201,
    description: 'App created successfully',
    type: AppResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async create(@TenantContext() tenantId: string, @Body() dto: CreateAppDto): Promise<AppResponseDto> {
    return this.appService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all apps',
    description: 'Retrieves all applications for the current tenant, including API key counts and message statistics.',
  })
  @ApiResponse({
    status: 200,
    description: 'Apps retrieved successfully',
    type: [AppResponseDto],
  })
  async findAll(@TenantContext() tenantId: string): Promise<AppResponseDto[]> {
    return this.appService.findAll(tenantId);
  }

  @Get('default')
  @ApiOperation({
    summary: 'Get or create default app',
    description: 'Retrieves the default app for the tenant, creating one if it doesn\'t exist. Used for simplified messaging.',
  })
  @ApiResponse({
    status: 200,
    description: 'Default app retrieved or created successfully',
    type: AppResponseDto,
  })
  async getDefaultApp(@TenantContext() tenantId: string): Promise<AppResponseDto> {
    return this.appService.getOrCreateDefaultApp(tenantId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get app by ID',
    description: 'Retrieves a specific application by its ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'App retrieved successfully',
    type: AppResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'App not found',
  })
  async findOne(@Param('id') id: string, @TenantContext() tenantId: string): Promise<AppResponseDto> {
    return this.appService.findOne(id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update app',
    description: 'Updates app name, description, or status.',
  })
  @ApiResponse({
    status: 200,
    description: 'App updated successfully',
    type: AppResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'App not found',
  })
  async update(
    @Param('id') id: string,
    @TenantContext() tenantId: string,
    @Body() dto: UpdateAppDto,
  ): Promise<AppResponseDto> {
    return this.appService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete app',
    description: 'Deletes an application and all its associated API keys. This action cannot be undone.',
  })
  @ApiResponse({
    status: 200,
    description: 'App deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'App not found',
  })
  async delete(@Param('id') id: string, @TenantContext() tenantId: string): Promise<{ message: string }> {
    await this.appService.delete(id, tenantId);
    return { message: 'App deleted successfully' };
  }

  @Get(':id/messages/batches')
  @ApiOperation({
    summary: 'Get message batches for app',
    description: 'Retrieves message batches sent through this app, including individual message details with pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Message batches retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'App not found',
  })
  async getMessageBatches(
    @Param('id') id: string,
    @TenantContext() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    // Verify app belongs to tenant
    await this.appService.findOne(id, tenantId);
    
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.messagingService.getMessageBatches(id, pageNum, limitNum);
  }
}
