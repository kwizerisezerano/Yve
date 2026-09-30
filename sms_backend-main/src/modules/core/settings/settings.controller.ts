import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('sms-price')
  @ApiOperation({ summary: 'Get current SMS price in RWF' })
  async getSmsPrice() {
    const price = await this.settingsService.getSmsPrice();
    return { smsPrice: price, currency: 'RWF' };
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public settings (no auth required)' })
  async getPublicSettings() {
    const smsPrice = await this.settingsService.getSmsPrice();
    return {
      smsPrice,
      currency: 'RWF',
    };
  }

  @Get()
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all settings for authenticated users' })
  async getAllSettings() {
    const smsPrice = await this.settingsService.getSmsPrice();
    return {
      smsPrice,
      currency: 'RWF',
    };
  }
}
