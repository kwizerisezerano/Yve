import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('opco-callback')
@Controller('callback/opco')
export class OpcoCallbackController {
  private readonly logger = new Logger(OpcoCallbackController.name);

  @Post(':adapterId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'OPCO delivery callback (stub)',
    description:
      'Not wired up yet — just logs whatever sms.to sends so we can see ' +
      'its real payload shape before building the status-update + ' +
      'forward-to-Core logic.',
  })
  @ApiParam({ name: 'adapterId', description: "This adapter's message id" })
  @ApiOkResponse({ description: 'Payload logged.' })
  handle(
    @Param('adapterId') adapterId: string,
    @Body() payload: unknown,
  ): { received: true } {
    this.logger.log(
      `OPCO callback for ${adapterId}: ${JSON.stringify(payload)}`,
    );

    return { received: true };
  }
}
