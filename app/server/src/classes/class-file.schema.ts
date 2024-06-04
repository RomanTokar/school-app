import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClassFileDocument = HydratedDocument<ClassFile>;

@Schema()
export class ClassFile {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  notes: string;

  @Prop({ required: false, type: String, default: null })
  url: string;
}

export const ClassFileSchema = SchemaFactory.createForClass(ClassFile);
