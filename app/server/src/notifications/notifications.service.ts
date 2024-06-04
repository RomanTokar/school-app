import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  create(
    createNotificationDto: CreateNotificationDto | CreateNotificationDto[],
  ) {
    let notifications: Notification[] = [];
    if (Array.isArray(createNotificationDto)) {
      notifications = createNotificationDto.map((n) => ({
        ...n,
        userId: new Types.ObjectId(n.userId),
        isRead: false,
      }));
    } else {
      notifications = [
        {
          ...createNotificationDto,
          userId: new Types.ObjectId(createNotificationDto.userId),
          isRead: false,
        },
      ];
    }
    return this.notificationModel.create(notifications);
  }

  findAll(userId: string) {
    return this.notificationModel.find({ userId: new Types.ObjectId(userId) });
  }

  findOne(id: string) {
    return this.notificationModel.findOne({ _id: id });
  }

  async readNotifications(userId: string) {
    await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true },
    );
  }

  async readNotification(userId: string, id: string) {
    await this.notificationModel.updateOne(
      { _id: id, userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true },
    );
  }
}
