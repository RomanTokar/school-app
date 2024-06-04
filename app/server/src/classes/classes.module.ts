import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CitiesModule } from '../cities/cities.module';
import { MatnasesModule } from '../matnases/matnases.module';
import { S3Module } from '../s3/s3.module';
import { StudentsModule } from '../students/students.module';
import { TeachersModule } from '../teachers/teachers.module';
import {
  ClassFileRelationship,
  ClassFileRelationshipSchema,
} from './class-file-relationship.schema';
import { ClassFile, ClassFileSchema } from './class-file.schema';
import {
  ClassNoteRelationship,
  ClassNoteRelationshipSchema,
} from './class-note-relationship.schema';
import { ClassNote, ClassNoteSchema } from './class-note.schema';
import { Class, ClassSchema } from './class.schema';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import {
  StudentClassPresence,
  StudentClassPresenceSchema,
} from './student-class-presence.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Class.name, schema: ClassSchema },
      { name: ClassNote.name, schema: ClassNoteSchema },
      { name: ClassFile.name, schema: ClassFileSchema },
      { name: ClassNoteRelationship.name, schema: ClassNoteRelationshipSchema },
      { name: ClassFileRelationship.name, schema: ClassFileRelationshipSchema },
      { name: StudentClassPresence.name, schema: StudentClassPresenceSchema },
    ]),
    S3Module,
    TeachersModule,
    StudentsModule,
    MatnasesModule,
    CitiesModule,
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
})
export class ClassesModule {}
