import { Module } from '@nestjs/common';
import { RemindsService } from './reminds.service';
import { RemindsController } from './reminds.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Remind, RemindSchema } from './remind.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Remind.name, schema: RemindSchema }]),
    NotificationsModule,
  ],
  controllers: [RemindsController],
  providers: [RemindsService],
})
export class RemindsModule {}
