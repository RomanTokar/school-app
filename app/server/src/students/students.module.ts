import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Student, StudentSchema } from './student.schema';
import { StudentNote, StudentNoteSchema } from './student-note.schema';
import { Class, ClassSchema } from '../classes/class.schema';
import { S3Module } from '../s3/s3.module';
import { MatnasesModule } from '../matnases/matnases.module';
import { SchoolsModule } from '../schools/schools.module';
import { CitiesModule } from '../cities/cities.module';
import { StudentFile, StudentFileSchema } from './student-file.schema';
import {
  StudentClassPresence,
  StudentClassPresenceSchema,
} from '../classes/student-class-presence.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: StudentNote.name, schema: StudentNoteSchema },
      { name: Class.name, schema: ClassSchema },
      { name: StudentFile.name, schema: StudentFileSchema },
      { name: StudentClassPresence.name, schema: StudentClassPresenceSchema },
    ]),
    S3Module,
    MatnasesModule,
    SchoolsModule,
    CitiesModule,
  ],
  exports: [StudentsService],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
