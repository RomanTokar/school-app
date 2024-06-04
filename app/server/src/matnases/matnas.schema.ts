import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MatnasDocument = HydratedDocument<Matnas>;

@Schema()
export class Matnas {
  @Prop({ required: true, type: String, unique: true })
  name: string;
}

export const MatnasSchema = SchemaFactory.createForClass(Matnas);
