import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TeacherNoteDocument = HydratedDocument<TeacherNote>;

@Schema({ timestamps: true })
export class TeacherNote {
  @Prop({ type: Types.ObjectId, ref: 'Teacher', index: true })
  teacherId: Types.ObjectId;

  @Prop({ required: true, type: String })
  text: string;
}

export const TeacherNoteSchema = SchemaFactory.createForClass(TeacherNote);
