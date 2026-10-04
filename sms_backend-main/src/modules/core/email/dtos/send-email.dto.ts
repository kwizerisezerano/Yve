import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class EmailRecipient {
  @ApiProperty({ example: 'recipient@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  name?: string;
}

export class SendEmailDto {
  @ApiProperty({ type: [EmailRecipient], description: 'List of email recipients' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailRecipient)
  to!: EmailRecipient[];

  @ApiProperty({ example: 'noreply@yourdomain.com', description: 'Sender email address' })
  @IsEmail()
  from!: string;

  @ApiProperty({ example: 'Welcome to Our Service', description: 'Email subject' })
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiProperty({ example: '<h1>Hello</h1><p>Welcome!</p>', description: 'HTML email body' })
  @IsString()
  @IsNotEmpty()
  html!: string;

  @ApiProperty({ example: 'Hello, welcome!', description: 'Plain text version', required: false })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({ 
    example: { orderId: '12345', userId: '67890' },
    description: 'Custom metadata for tracking',
    required: false 
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class SendEmailResponseDto {
  @ApiProperty({ example: 'batch_1234567890_abc123' })
  batchId!: string;

  @ApiProperty({ example: 5 })
  totalEmails!: number;

  @ApiProperty({ example: 0.05 })
  totalCost!: number;

  @ApiProperty({ example: 0.01 })
  emailCost!: number;

  @ApiProperty({ example: 'QUEUED' })
  status!: string;

  @ApiProperty({ type: [Object] })
  emails!: EmailMessageDetail[];
}

export class EmailMessageDetail {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  to!: string;

  @ApiProperty()
  from!: string;

  @ApiProperty()
  subject!: string;

  @ApiProperty()
  cost!: number;

  @ApiProperty()
  status!: string;
}
