import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StudentClassPresenceDocument =
  HydratedDocument<StudentClassPresence>;

@Schema()
export class StudentClassPresence {
  @Prop({ type: Types.ObjectId, ref: 'Class' })
  classId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Student' })
  studentId: Types.ObjectId;
}

export const StudentClassPresenceSchema =
  SchemaFactory.createForClass(StudentClassPresence);

StudentClassPresenceSchema.index({ classId: 1, studentId: 1 });
StudentClassPresenceSchema.index({ studentId: 1 });
