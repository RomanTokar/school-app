import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClassNoteDocument = HydratedDocument<ClassNote>;

@Schema({ timestamps: true })
export class ClassNote {
  @Prop({ required: true, type: String })
  text: string;
}

export const ClassNoteSchema = SchemaFactory.createForClass(ClassNote);
