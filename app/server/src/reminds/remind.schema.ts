import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RemindDocument = HydratedDocument<Remind>;

@Schema()
export class Remind {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: true, type: String })
  text: string;

  @Prop({ required: false, type: Boolean, default: false })
  isSent: boolean;
}

export const RemindSchema = SchemaFactory.createForClass(Remind);

RemindSchema.index({ userId: 1, date: 1 });
RemindSchema.index({ isSent: 1 });
