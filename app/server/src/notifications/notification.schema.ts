import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

export const notificationTypes = ['remind'] as const;
export type NotificationType = (typeof notificationTypes)[number];

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: String, enum: notificationTypes })
  type: NotificationType;

  @Prop({ required: true, type: Object })
  data: Record<string, unknown>;

  @Prop({ required: false, type: Boolean, default: false })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ userId: 1, isRead: 1 });
