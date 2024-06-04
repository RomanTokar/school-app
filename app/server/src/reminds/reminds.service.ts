import { Injectable } from '@nestjs/common';
import { CreateRemindDto } from './dto/create-remind.dto';
import { SchedulerRegistry, Timeout } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Remind } from './remind.schema';
import { CronJob } from 'cron';
import { NotificationsService } from '../notifications/notifications.service';
import { GetRemindsQueryDto } from './dto/get-reminds-query.dto';
import { isFuture, isPast } from 'date-fns';

@Injectable()
export class RemindsService {
  constructor(
    @InjectModel(Remind.name) private remindModel: Model<Remind>,
    private schedulerRegistry: SchedulerRegistry,
    private notificationsService: NotificationsService,
  ) {}

  async create(createRemindDto: CreateRemindDto & { userId: string }) {
    const remind: Remind = {
      text: createRemindDto.text,
      date: new Date(createRemindDto.date),
      isSent: false,
      userId: new Types.ObjectId(createRemindDto.userId),
    };
    const createdRemind = await this.remindModel.create(remind);
    const job = new CronJob(
      remind.date,
      async () => {
        await this.notificationsService.create({
          type: 'remind',
          userId: remind.userId.toString(),
          data: { text: remind.text },
        });
        await this.remindModel.updateOne(
          { _id: createdRemind._id },
          { isSent: true },
        );
      },
      null,
      true,
      undefined,
      undefined,
      undefined,
      0,
    );
    this.schedulerRegistry.addCronJob(
      `remind-${createdRemind._id.toString()}`,
      job,
    );
    return createdRemind;
  }

  async findAll(userId: string, { startDate, endDate }: GetRemindsQueryDto) {
    return this.remindModel.find({
      $and: [
        { userId: new Types.ObjectId(userId) },
        startDate ? { date: { $gte: startDate } } : {},
        endDate ? { date: { $lte: endDate } } : {},
      ],
    });
  }

  async findOne(id: string) {
    return this.remindModel.findOne({ _id: id });
  }

  async remove(id: string) {
    this.schedulerRegistry.deleteCronJob(`remind-${id}`);
    await this.remindModel.findByIdAndDelete(id);
  }

  @Timeout(5000)
  async runCronJobForUnsentReminds() {
    const unsentReminds = await this.remindModel.find({ isSent: false });
    const unsentRemindsInPast = unsentReminds.filter((r) => isPast(r.date));
    const unsentRemindsInFuture = unsentReminds.filter((r) => isFuture(r.date));
    await this.notificationsService.create(
      unsentRemindsInPast.map((r) => ({
        type: 'remind',
        userId: r.userId.toString(),
        data: { text: r.text },
      })),
    );
    await this.remindModel.updateMany(
      { _id: { $in: unsentRemindsInPast.map((r) => r._id.toString()) } },
      { isSent: true },
    );
    unsentRemindsInFuture.forEach((remind) => {
      const job = new CronJob(
        remind.date,
        async () => {
          await this.notificationsService.create({
            type: 'remind',
            userId: remind.userId.toString(),
            data: { text: remind.text },
          });
          await this.remindModel.updateOne(
            { _id: remind._id.toString() },
            { isSent: true },
          );
        },
        null,
        true,
        undefined,
        undefined,
        undefined,
        0,
      );
      this.schedulerRegistry.addCronJob(`remind-${remind._id.toString()}`, job);
    });
  }
}
