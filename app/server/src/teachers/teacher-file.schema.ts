import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TeacherFileDocument = HydratedDocument<TeacherFile>;

@Schema()
export class TeacherFile {
  @Prop({ type: Types.ObjectId, ref: 'Teacher', index: true })
  teacherId: Types.ObjectId;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  notes: string;

  @Prop({ required: false, type: String, default: null })
  url: string;
}

export const TeacherFileSchema = SchemaFactory.createForClass(TeacherFile);
