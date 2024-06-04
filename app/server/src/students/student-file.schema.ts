import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StudentFileDocument = HydratedDocument<StudentFile>;

@Schema()
export class StudentFile {
  @Prop({ type: Types.ObjectId, ref: 'Student', index: true })
  studentId: Types.ObjectId;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  notes: string;

  @Prop({ required: false, type: String, default: null })
  url: string;
}

export const StudentFileSchema = SchemaFactory.createForClass(StudentFile);
