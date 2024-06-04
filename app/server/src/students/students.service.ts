import { Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Student } from './student.schema';
import { StudentNote } from './student-note.schema';
import { CreateStudentNoteDto } from './dto/create-student-note.dto';
import { GetStudentsQueryDto } from './dto/get-students-query.dto';
import { Class } from '../classes/class.schema';
import { StudentDto } from './dto/student.dto';
import * as sharp from 'sharp';
import S3Service from '../s3/s3.service';
import { GetStudentClassesQueryDto } from './dto/get-student-classes-query.dto';
import { StudentFile } from './student-file.schema';
import { UploadStudentFileDto } from './dto/upload-student-file.dto';
import { TeacherDocument } from '../teachers/teacher.schema';
import { StudentClassPresence } from '../classes/student-class-presence.schema';
import { GetStudentPresenceQueryDto } from './dto/get-student-presence-query.dto';
import { omit, pick } from 'lodash';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(StudentNote.name) private studentNoteModel: Model<StudentNote>,
    @InjectModel(Class.name) private classModel: Model<Class>,
    @InjectModel(StudentFile.name) private studentFileModel: Model<StudentFile>,
    @InjectModel(StudentClassPresence.name)
    private studentClassPresenceModel: Model<StudentClassPresence>,
    private S3Service: S3Service,
  ) {}

  create(createStudentDto: CreateStudentDto) {
    return this.studentModel.create<Student>(createStudentDto);
  }

  async findAll({
    fullName,
    city,
    school,
    matnas,
  }: GetStudentsQueryDto): Promise<StudentDto[]> {
    const students = await this.studentModel.find({
      $and: [
        city ? { city } : {},
        school ? { school } : {},
        matnas ? { matnas } : {},
        fullName ? { fullName: { $regex: new RegExp(fullName, 'i') } } : {},
      ],
    });

    const classes = await this.classModel
      .find({
        studentsIds: {
          $elemMatch: { $in: students.map((s) => s._id.toString()) },
        },
      })
      .select('_id');
    return students.map((student) => ({
      ...student.toObject(),
      _id: student._id.toString(),
      classesCount: classes.length,
    }));
  }

  async findOne(studentId: string): Promise<StudentDto> {
    const student = await this.studentModel.findById(studentId);
    if (!student) return null;

    const classes = await this.classModel
      .find({
        studentsIds: studentId,
      })
      .select('_id');

    return { ...student.toObject(), classesCount: classes.length };
  }

  async getStudentPresence(
    studentId: string,
    { startDate, endDate }: GetStudentPresenceQueryDto,
  ) {
    const [classesCount, attendedClasses] = await Promise.all([
      this.classModel
        .find({
          $and: [
            { studentsIds: studentId },
            startDate ? { startDate: { $gte: startDate } } : {},
            endDate ? { endDate: { $lte: endDate } } : {},
          ],
        })
        .count(),
      this.studentClassPresenceModel
        .find({
          studentId: new Types.ObjectId(studentId),
        })
        .select('_id'),
    ]);
    const attendedClassesCount = await this.classModel
      .find({
        $and: [
          { _id: { $in: attendedClasses.map((c) => c._id.toString()) } },
          startDate ? { startDate: { $gte: startDate } } : {},
          endDate ? { endDate: { $lte: endDate } } : {},
        ],
      })
      .count();
    const present = (attendedClassesCount / classesCount) * 100;
    const absent = 100 - present;
    return {
      absent,
      present,
    };
  }

  update(studentId: string, updateStudentDto: UpdateStudentDto) {
    return this.studentModel.findOneAndUpdate(
      { _id: studentId },
      updateStudentDto,
      { new: true },
    );
  }

  async remove(studentId: string) {
    await this.deleteAvatar(studentId);
    await this.studentModel.deleteOne({ _id: studentId });
  }

  async uploadAvatar(studentId: string, avatar: Express.Multer.File) {
    await this.deleteAvatar(studentId);
    const resizedImage = await sharp(avatar.buffer)
      .resize(200)
      .jpeg()
      .toBuffer();
    const objectKey = `/students/${studentId}/avatar.jpeg`;
    await this.S3Service.putObject({
      Key: objectKey,
      Body: resizedImage,
    });
    const avatarURI = `${this.S3Service.baseBucketURI}${objectKey}`;
    await this.studentModel.updateOne(
      { _id: studentId },
      {
        avatar: avatarURI,
      },
    );
    return avatarURI;
  }

  async deleteAvatar(studentId: string) {
    const student = await this.findOne(studentId);
    if (!student) return;
    if (!student.avatar) return;
    await this.S3Service.deleteObjects({
      Keys: [student.avatar.replace(this.S3Service.baseBucketURI, '')],
    });
    await this.studentModel.updateOne(
      { _id: studentId },
      {
        avatar: null,
      },
    );
  }

  async removeStudentFromClasses(studentId: string) {
    await this.classModel.updateMany(
      { studentsIds: studentId },
      { $pull: { studentsIds: studentId } },
    );
  }

  async findFiles(studentId: string) {
    return this.studentFileModel.find({ studentId });
  }

  async findFile(studentId: string, fileId: string) {
    return this.studentFileModel.findOne({ _id: fileId, studentId });
  }

  async uploadFile(
    studentId: string,
    file: Express.Multer.File,
    uploadStudentFileDto: UploadStudentFileDto,
  ) {
    const studentFile = await this.studentFileModel.create({
      studentId,
      name: uploadStudentFileDto.name,
      notes: uploadStudentFileDto.notes,
    });
    const objectKey = `/students/${studentId}/files/${studentFile._id.toString()}.${file.originalname
      .split('.')
      .pop()}`;
    await this.S3Service.putObject({
      Key: objectKey,
      Body: file.buffer,
    });
    studentFile.url = `${this.S3Service.baseBucketURI}${objectKey}`;
    return studentFile.save();
  }

  async deleteFile(studentId: string, fileId: string) {
    const studentFile = await this.studentFileModel.findOne({
      _id: fileId,
      studentId,
    });
    await this.S3Service.deleteObjects({
      Keys: [studentFile.url.replace(this.S3Service.baseBucketURI, '')],
    });
    await this.studentFileModel.deleteOne({
      _id: fileId,
      studentId,
    });
  }

  async createNote(
    studentId: string,
    createStudentNoteDto: CreateStudentNoteDto,
  ) {
    return this.studentNoteModel.create({
      ...createStudentNoteDto,
      studentId: new Types.ObjectId(studentId),
    });
  }

  async removeNotes(studentId: string) {
    await this.studentNoteModel.deleteMany({
      studentId: new Types.ObjectId(studentId),
    });
  }

  async removeNote(studentId: string, noteId: string) {
    await this.studentNoteModel.deleteOne({
      _id: new Types.ObjectId(noteId),
      studentId: new Types.ObjectId(studentId),
    });
  }

  async getNotes(studentId: string) {
    return this.studentNoteModel
      .find({
        studentId: new Types.ObjectId(studentId),
      })
      .select('-studentId');
  }

  async getClasses(
    studentId: string,
    { name: className }: GetStudentClassesQueryDto,
  ) {
    const classes = await this.classModel
      .find({
        $and: [
          { studentsIds: studentId },
          className ? { name: { $regex: new RegExp(className, 'i') } } : {},
        ],
      })
      .populate<{ userId: TeacherDocument }>({
        path: 'teacherId',
        select: 'fullName',
      });
    return classes.map((c) => ({
      ...omit(c.toObject(), ['teacherId', '__v']),
      teacher: pick(c.teacherId, ['_id', 'fullName']),
      studentsCount: c.studentsIds.length,
    }));
  }
}
