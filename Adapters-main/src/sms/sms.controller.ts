import {
  Controller,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentAccountId } from './decorators/current-account-id.decorator';
import { SendSmsDto } from './dto/send-sms.dto';
import { SendSmsResponseDto } from './dto/send-sms-response.dto';
import { SmsMessageStatusDto } from './dto/sms-message-status.dto';
import { ApiKeyGuard } from './guards/api-key.guard';
import { SmsService } from './sms.service';

@ApiTags('sms')
@ApiSecurity('api-key')
@UseGuards(ApiKeyGuard)
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Queue an SMS for delivery',
    description:
      'Saves the message and acknowledges immediately. Delivery to the ' +
      'downstream carrier (OPCO) happens asynchronously — the final status ' +
      'is later pushed to the callback_url you provide here. Safe to retry ' +
      'with the same message_id: retries return the original result instead ' +
      'of sending the SMS again.',
  })
  @ApiAcceptedResponse({
    description: 'Message accepted and queued.',
    type: SendSmsResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid x-api-key.' })
  send(
    @CurrentAccountId() accountId: string,
    @Body() dto: SendSmsDto,
  ): Promise<SendSmsResponseDto> {
    return this.smsService.create(accountId, dto);
  }

  @Get(':adapterId')
  @ApiOperation({
    summary: 'Check the status of a previously sent message',
    description:
      'A fallback for when the callback to your callback_url is delayed, ' +
      "lost, or you'd simply rather poll.",
  })
  @ApiParam({ name: 'adapterId', description: "This adapter's message id" })
  @ApiOkResponse({ description: 'Message found.', type: SmsMessageStatusDto })
  @ApiNotFoundResponse({
    description: 'No message with this id for this account.',
  })
  findOne(
    @CurrentAccountId() accountId: string,
    @Param('adapterId', ParseUUIDPipe) adapterId: string,
  ): Promise<SmsMessageStatusDto> {
    return this.smsService.findOne(accountId, adapterId);
  }
}
