import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ClassFileRelationshipDocument =
  HydratedDocument<ClassFileRelationship>;

@Schema()
export class ClassFileRelationship {
  @Prop({ type: Types.ObjectId, ref: 'Class', index: true })
  classId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ClassFile', index: true })
  fileId: Types.ObjectId;
}

export const ClassFileRelationshipSchema = SchemaFactory.createForClass(
  ClassFileRelationship,
);

ClassFileRelationshipSchema.index({ classId: 1, fileId: 1 });
ClassFileRelationshipSchema.index({ fileId: 1 });
