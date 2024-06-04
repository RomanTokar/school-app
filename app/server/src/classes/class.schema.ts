import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Student } from '../students/student.schema';

export type ClassDocument = HydratedDocument<Class>;

@Schema()
export class Class {
  @Prop({ required: true, type: Types.ObjectId, index: true })
  classId: Types.ObjectId;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  location: string;

  @Prop({ required: true, type: String })
  city: string;

  @Prop({ required: true, type: String })
  matnas: string;

  @Prop({ required: true, type: String })
  groupLink: string;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;

  @Prop({ required: true, type: Boolean, default: false })
  isRecurring: boolean;

  @Prop({ required: false, type: Date })
  recurringEndDate?: Date;

  @Prop({ required: false, type: String, enum: ['weekly'] })
  recurringType?: 'weekly';

  @Prop({ required: true, type: Types.ObjectId, ref: 'Teacher' })
  teacherId: Types.ObjectId;

  @Prop({
    default: [],
    type: [{ type: Types.ObjectId, ref: 'Student' }],
  })
  studentsIds: Student[];
}

export const ClassSchema = SchemaFactory.createForClass(Class);

ClassSchema.index({ classId: 1, startDate: 1 });
ClassSchema.index({ startDate: 1, endDate: 1 });
ClassSchema.index({ teacherId: 1, startDate: 1, endDate: 1 });
