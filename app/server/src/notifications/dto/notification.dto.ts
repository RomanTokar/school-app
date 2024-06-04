import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { MongodbIdDto } from '../../dto/mongodb-id.dto';
import { CreateNotificationDto } from './create-notification.dto';
import { IsBoolean } from 'class-validator';

export class NotificationDto extends IntersectionType(
  CreateNotificationDto,
  MongodbIdDto,
) {
  @ApiProperty({ example: false })
  @IsBoolean()
  isRead: boolean;
}
