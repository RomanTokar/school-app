import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CityDocument = HydratedDocument<City>;

@Schema()
export class City {
  @Prop({ required: true, type: String, unique: true })
  name: string;
}

export const CitySchema = SchemaFactory.createForClass(City);
