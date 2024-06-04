import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { NotificationType, notificationTypes } from '../notification.schema';

export class CreateNotificationDto {
  @ApiProperty({ example: 'Notification type' })
  @IsString()
  @IsEnum(notificationTypes)
  type: NotificationType;

  @ApiProperty({ example: 'gkdjgkj2gkdjekj3' })
  @IsString()
  userId: string;

  @ApiProperty({
    example: { text: 'Notification text' },
  })
  data: Record<string, unknown>;
}
