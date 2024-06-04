import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Teacher, TeacherSchema } from './teacher.schema';
import { UsersModule } from '../users/users.module';
import { TeacherNote, TeacherNoteSchema } from './teacher-note.schema';
import { Class, ClassSchema } from '../classes/class.schema';
import { S3Module } from '../s3/s3.module';
import { Student, StudentSchema } from '../students/student.schema';
import { TeacherFile, TeacherFileSchema } from './teacher-file.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Teacher.name, schema: TeacherSchema },
      { name: TeacherNote.name, schema: TeacherNoteSchema },
      { name: Class.name, schema: ClassSchema },
      { name: Student.name, schema: StudentSchema },
      { name: TeacherFile.name, schema: TeacherFileSchema },
    ]),
    UsersModule,
    S3Module,
  ],
  exports: [TeachersService],
  controllers: [TeachersController],
  providers: [TeachersService],
})
export class TeachersModule {}
