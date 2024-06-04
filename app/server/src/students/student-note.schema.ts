import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StudentNoteDocument = HydratedDocument<StudentNote>;

@Schema({ timestamps: true })
export class StudentNote {
  @Prop({ type: Types.ObjectId, ref: 'Student', index: true })
  studentId: Types.ObjectId;

  @Prop({ required: true, type: String })
  text: string;
}

export const StudentNoteSchema = SchemaFactory.createForClass(StudentNote);
