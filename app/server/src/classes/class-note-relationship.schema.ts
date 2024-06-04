import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ClassNoteRelationshipDocument =
  HydratedDocument<ClassNoteRelationship>;

@Schema()
export class ClassNoteRelationship {
  @Prop({ type: Types.ObjectId, ref: 'Class', index: true })
  classId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ClassNote', index: true })
  noteId: Types.ObjectId;
}

export const ClassNoteRelationshipSchema = SchemaFactory.createForClass(
  ClassNoteRelationship,
);

ClassNoteRelationshipSchema.index({ classId: 1, noteId: 1 });
ClassNoteRelationshipSchema.index({ noteId: 1 });
