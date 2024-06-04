import { Injectable } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Model, Types } from 'mongoose';
import { Teacher, TeacherDocument } from './teacher.schema';
import { InjectModel } from '@nestjs/mongoose';
import { groupBy, mapValues, pick, uniq } from 'lodash';
import { TeacherNote } from './teacher-note.schema';
import { CreateTeacherNoteDto } from './dto/create-teacher-note.dto';
import { UserDocument } from '../users/user.schema';
import { Class } from '../classes/class.schema';
import { GetTeachersQueryDto } from './dto/get-teachers-query.dto';
import { TeacherDto } from './dto/teacher.dto';
import * as sharp from 'sharp';
import S3Service from '../s3/s3.service';
import { Student } from '../students/student.schema';
import { UploadTeacherFileDto } from './dto/upload-teacher-file.dto';
import { TeacherFile } from './teacher-file.schema';

@Injectable()
export class TeachersService {
  constructor(
    @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
    @InjectModel(TeacherNote.name) private teacherNoteModel: Model<TeacherNote>,
    @InjectModel(Class.name) private classModel: Model<Class>,
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(TeacherFile.name) private teacherFileModel: Model<TeacherFile>,
    private S3Service: S3Service,
  ) {}

  create(
    createTeacherDto: Pick<CreateTeacherDto, 'fullName'> & { userId: string },
  ) {
    return this.teacherModel.create({
      ...createTeacherDto,
      userId: new Types.ObjectId(createTeacherDto.userId),
    });
  }

  async findAll({ fullName }: GetTeachersQueryDto): Promise<TeacherDto[]> {
    const findQuery = this.teacherModel
      .find()
      .populate<{ userId: UserDocument }>({
        path: 'userId',
        select: 'email phoneNumber',
      });

    if (fullName) {
      findQuery.where('fullName').regex(new RegExp(fullName, 'i'));
    }

    const teachers = await findQuery;
    const classes = await this.classModel
      .find({
        teacherId: { $in: teachers.map((teacher) => teacher._id.toString()) },
      })
      .select('teacherId');
    const teacherIdToClassesCountMap = mapValues(
      groupBy(classes, 'teacherId'),
      (classes) => classes.length,
    );
    return teachers.map((teacher) => ({
      ...pick(teacher.toObject(), ['_id', 'fullName', 'avatar']),
      ...pick(teacher.userId, ['email', 'phoneNumber']),
      classesCount: teacherIdToClassesCountMap[teacher._id.toString()] || 0,
    }));
  }

  async findOneWithUserPopulation(teacherId: string) {
    const teacher = await this.teacherModel
      .findById(teacherId)
      .populate<{ userId: UserDocument }>({
        path: 'userId',
        select: 'email phoneNumber',
      });
    if (!teacher) return null;
    const classes = await this.classModel
      .find({
        teacherId,
      })
      .select('_id');
    return {
      ...pick(teacher.toObject(), ['_id', 'fullName', 'avatar']),
      ...pick(teacher.userId, ['email', 'phoneNumber']),
      classesCount: classes.length,
    };
  }

  async findOne(teacherId: string): Promise<TeacherDocument> {
    return this.teacherModel.findById(teacherId);
  }

  async findOneByUserId(userId: string): Promise<TeacherDocument> {
    return this.teacherModel.findOne({ userId: new Types.ObjectId(userId) });
  }

  async update(
    teacherId: string,
    updateTeacherDto: UpdateTeacherDto,
  ): Promise<TeacherDocument> {
    return this.teacherModel.findOneAndUpdate(
      { _id: teacherId },
      pick(updateTeacherDto, ['fullName']),
      { new: true },
    );
  }

  async remove(teacherId: string) {
    await this.deleteAvatar(teacherId);
    await this.teacherModel.deleteOne({ _id: teacherId });
  }

  async uploadAvatar(teacherId: string, avatar: Express.Multer.File) {
    await this.deleteAvatar(teacherId);
    const resizedImage = await sharp(avatar.buffer)
      .resize(200)
      .jpeg()
      .toBuffer();
    const objectKey = `/teachers/${teacherId}/avatar.jpeg`;
    await this.S3Service.putObject({
      Key: objectKey,
      Body: resizedImage,
    });
    const avatarURI = `${this.S3Service.baseBucketURI}${objectKey}`;
    await this.teacherModel.updateOne(
      { _id: teacherId },
      {
        avatar: avatarURI,
      },
    );
    return avatarURI;
  }

  async deleteAvatar(teacherId: string) {
    const teacher = await this.findOne(teacherId);
    if (!teacher) return;
    if (!teacher.avatar) return;
    await this.S3Service.deleteObjects({
      Keys: [teacher.avatar.replace(this.S3Service.baseBucketURI, '')],
    });
    await this.teacherModel.updateOne(
      { _id: teacherId },
      {
        avatar: null,
      },
    );
  }

  async findTeacherFiles(teacherId: string) {
    return this.teacherFileModel.find({ teacherId });
  }

  async findTeacherFile(teacherId: string, fileId: string) {
    return this.teacherFileModel.findOne({ _id: fileId, teacherId });
  }

  async uploadFile(
    teacherId: string,
    file: Express.Multer.File,
    uploadTeacherFileDto: UploadTeacherFileDto,
  ) {
    const teacherFile = await this.teacherFileModel.create({
      teacherId,
      name: uploadTeacherFileDto.name,
      notes: uploadTeacherFileDto.notes,
    });
    const objectKey = `/teachers/${teacherId}/files/${teacherFile._id.toString()}.${file.originalname
      .split('.')
      .pop()}`;
    await this.S3Service.putObject({
      Key: objectKey,
      Body: file.buffer,
    });
    teacherFile.url = `${this.S3Service.baseBucketURI}${objectKey}`;
    return teacherFile.save();
  }

  async deleteFile(teacherId: string, fileId: string) {
    const teacherFile = await this.teacherFileModel.findOne({
      _id: fileId,
      teacherId,
    });
    await this.S3Service.deleteObjects({
      Keys: [teacherFile.url.replace(this.S3Service.baseBucketURI, '')],
    });
    await this.teacherFileModel.deleteOne({ _id: fileId, teacherId });
  }

  async getStudents(teacherId: string) {
    const classes = await this.classModel
      .find()
      .where('teacherId', teacherId)
      .select('studentsIds');
    const studentsIds = uniq(classes.flatMap((c) => c.studentsIds));
    return this.studentModel.find().where('_id').in(studentsIds);
  }

  async getNumberOfStudents(teacherId: string) {
    const classes = await this.classModel
      .find()
      .where('teacherId', teacherId)
      .select('studentsIds');
    const studentsIds = uniq(classes.flatMap((c) => c.studentsIds));
    return this.studentModel
      .find()
      .where('_id')
      .in(studentsIds)
      .select('_id')
      .count();
  }

  async createNote(
    teacherId: string,
    createTeacherNoteDto: CreateTeacherNoteDto,
  ) {
    return this.teacherNoteModel.create({
      ...createTeacherNoteDto,
      teacherId: new Types.ObjectId(teacherId),
    });
  }

  async getNotes(teacherId: string) {
    return this.teacherNoteModel
      .find({
        teacherId: new Types.ObjectId(teacherId),
      })
      .select('-teacherId');
  }

  async removeNote(noteId: string) {
    await this.teacherNoteModel.findByIdAndDelete(noteId);
  }

  async removeNotes(teacherId: string) {
    await this.teacherNoteModel.deleteMany({
      teacherId: new Types.ObjectId(teacherId),
    });
  }

  async removeTeacherFromClasses(teacherId: string) {
    await this.classModel.updateMany(
      { teacherId: new Types.ObjectId(teacherId) },
      { teacherId: null },
    );
  }
}
