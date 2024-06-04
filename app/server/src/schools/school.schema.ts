import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SchoolDocument = HydratedDocument<School>;

@Schema()
export class School {
  @Prop({ required: true, type: String, unique: true })
  name: string;
}

export const SchoolSchema = SchemaFactory.createForClass(School);
