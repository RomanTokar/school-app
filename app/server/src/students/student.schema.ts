import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StudentDocument = HydratedDocument<Student>;

@Schema()
export class Student {
  @Prop({ required: true, type: String })
  fullName: string;

  @Prop({ required: true, type: String })
  city: string;

  @Prop({ required: false, type: String })
  school: string;

  @Prop({ required: false, type: String })
  matnas: string;

  @Prop({ required: false, type: String })
  ID: string;

  @Prop({ required: true, type: String })
  phoneNumber: string;

  @Prop({ required: true, type: String })
  email: string;

  @Prop({ required: true, type: String })
  WhatsAppLink: string;

  @Prop({ type: String, default: null, required: false })
  avatar?: string | null;
}

export const StudentSchema = SchemaFactory.createForClass(Student);

StudentSchema.index({ city: 1, school: 1, matnas: 1 });
StudentSchema.index({ school: 1, matnas: 1 });
StudentSchema.index({ matnas: 1 });
