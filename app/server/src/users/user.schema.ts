import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../auth/role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, unique: true, type: String })
  email: string;

  @Prop({ required: true, unique: true, type: String })
  phoneNumber: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({
    type: String,
    enum: Object.values(Role),
    default: Role.Teacher,
  })
  role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);
