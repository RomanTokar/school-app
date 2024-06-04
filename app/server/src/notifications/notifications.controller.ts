import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../param-decorators/current-user';
import { NotificationDto } from './dto/notification.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiCreatedResponse({
    type: [NotificationDto],
  })
  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(@CurrentUser() user) {
    return this.notificationsService.findAll(user._id);
  }

  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('read')
  async readNotifications(@CurrentUser() user) {
    await this.notificationsService.readNotifications(user._id);
  }

  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id/read')
  async readNotification(@CurrentUser() user, @Param('id') id: string) {
    const notification = await this.notificationsService.findOne(id);
    if (!notification) throw new BadRequestException('Notification not found');
    if (notification.userId.toString() !== user._id) {
      throw new BadRequestException(
        'Notification does not belong to this user',
      );
    }
    return this.notificationsService.readNotification(user._id, id);
  }
}
