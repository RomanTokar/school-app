import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { addWeeks } from 'date-fns';
import { omit, pick } from 'lodash';
import { Model, Types } from 'mongoose';
import S3Service from '../s3/s3.service';
import { TeacherDocument } from '../teachers/teacher.schema';
import { overlapHoursMinutesSecondsMilliseconds } from '../utilities/date';
import { ClassFileRelationship } from './class-file-relationship.schema';
import { ClassFile, ClassFileDocument } from './class-file.schema';
import { ClassNoteRelationship } from './class-note-relationship.schema';
import { ClassNote, ClassNoteDocument } from './class-note.schema';
import { Class } from './class.schema';
import { AddStudentToClassDto } from './dto/add-student-to-class.dto';
import { ClassDto } from './dto/class.dto';
import { CreateClassNoteDto } from './dto/create-class-note.dto';
import { CreateClassDto } from './dto/create-class.dto';
import { DeleteClassFileDto } from './dto/delete-class-file.dto';
import { DeleteClassNoteDto } from './dto/delete-class-note.dto';
import { DeleteClassDto } from './dto/delete-class.dto';
import { GetClassesQueryDto } from './dto/get-classes-query.dto';
import { GetStudentsPresenceQueryDto } from './dto/get-students-presence-query.dto';
import { RemoveStudentFromClassDto } from './dto/remove-student-from-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { UploadClassFileDto } from './dto/upload-class-file.dto';
import { StudentClassPresence } from './student-class-presence.schema';

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(Class.name) private classModel: Model<Class>,
    @InjectModel(ClassNote.name) private classNoteModel: Model<ClassNote>,
    @InjectModel(ClassNoteRelationship.name)
    private classNoteRelationshipModel: Model<ClassNoteRelationship>,
    @InjectModel(ClassFileRelationship.name)
    private classFileRelationshipModel: Model<ClassFileRelationship>,
    @InjectModel(ClassFile.name) private classFileModel: Model<ClassFile>,
    @InjectModel(StudentClassPresence.name)
    private studentClassPresenceModel: Model<StudentClassPresence>,
    private S3Service: S3Service,
  ) {}

  create(createClassDto: CreateClassDto) {
    if (createClassDto.isRecurring) {
      const classId = new Types.ObjectId();
      const dateRanges: { startDate: Date; endDate: Date }[] = [];
      let currentRange = {
        startDate: new Date(createClassDto.startDate),
        endDate: new Date(createClassDto.endDate),
      };
      while (currentRange.endDate < new Date(createClassDto.recurringEndDate)) {
        dateRanges.push(currentRange);
        currentRange = {
          startDate: addWeeks(currentRange.startDate, 1),
          endDate: addWeeks(currentRange.endDate, 1),
        };
      }
      const classes: Class[] = dateRanges.map((range) => ({
        recurringEndDate: new Date(createClassDto.recurringEndDate),
        recurringType: 'weekly',
        classId,
        startDate: range.startDate,
        endDate: range.endDate,
        teacherId: new Types.ObjectId(createClassDto.teacherId),
        studentsIds: [],
        isRecurring: true,
        city: createClassDto.city,
        matnas: createClassDto.matnas,
        name: createClassDto.name,
        groupLink: createClassDto.groupLink,
        location: createClassDto.location,
      }));
      return this.classModel.create(classes);
    } else {
      const classEntity: Class = {
        classId: new Types.ObjectId(),
        startDate: new Date(createClassDto.startDate),
        endDate: new Date(createClassDto.endDate),
        teacherId: new Types.ObjectId(createClassDto.teacherId),
        studentsIds: [],
        isRecurring: false,
        city: createClassDto.city,
        matnas: createClassDto.matnas,
        name: createClassDto.name,
        groupLink: createClassDto.groupLink,
        location: createClassDto.location,
      };
      return this.classModel.create(classEntity);
    }
  }

  async findAll({ teacherId, startDate, endDate, name }: GetClassesQueryDto) {
    const classes = await this.classModel
      .find({
        $and: [
          teacherId ? { teacherId: new Types.ObjectId(teacherId) } : {},
          startDate ? { startDate: { $gte: startDate } } : {},
          endDate ? { endDate: { $lte: endDate } } : {},
          name ? { name: { $regex: new RegExp(name, 'i') } } : {},
        ],
      })
      .populate<{ userId: TeacherDocument }>({
        path: 'teacherId',
        select: 'fullName',
      });
    return classes.map((c) => ({
      ...omit(c.toObject(), ['teacherId', '__v', 'studentsIds']),
      teacher: pick(c.teacherId, ['_id', 'fullName']),
      studentsCount: c.studentsIds.length,
    }));
  }

  async findOne(classId: string): Promise<ClassDto> {
    const classEntity = await this.classModel
      .findById(classId)
      .populate<{ teacherId: TeacherDocument }>({
        path: 'teacherId',
        select: 'fullName',
      });
    if (!classEntity) return null;
    return {
      _id: classEntity._id.toString(),
      classId: classEntity.classId.toString(),
      name: classEntity.name,
      startDate: classEntity.startDate.toISOString(),
      endDate: classEntity.endDate.toISOString(),
      isRecurring: classEntity.isRecurring,
      city: classEntity.city,
      matnas: classEntity.matnas,
      groupLink: classEntity.groupLink,
      recurringEndDate: classEntity.recurringEndDate?.toISOString(),
      recurringType: classEntity.recurringType,
      location: classEntity.location,
      teacher: {
        _id: classEntity.teacherId._id.toString(),
        fullName: classEntity.teacherId.fullName,
      },
      studentsCount: classEntity.studentsIds.length,
    };
  }

  async updateSingleRecurring(classId: string, updateClassDto: UpdateClassDto) {
    return this.classModel.findOneAndUpdate(
      { _id: classId },
      omit(updateClassDto, ['updateType']),
      {
        new: true,
      },
    );
  }

  async updateAllRecurring(
    classEntity: ClassDto,
    updateClassDto: UpdateClassDto,
  ) {
    const classes = await this.classModel
      .find({ classId: new Types.ObjectId(classEntity.classId) })
      .sort({ startDate: 1 });
    if (updateClassDto.startDate && updateClassDto.endDate) {
      const dateRanges: { startDate: Date; endDate: Date }[] = [];
      const { startDate, endDate } = classes[0];
      let currentRange = {
        startDate: overlapHoursMinutesSecondsMilliseconds(
          startDate,
          new Date(updateClassDto.startDate),
        ),
        endDate: overlapHoursMinutesSecondsMilliseconds(
          endDate,
          new Date(updateClassDto.endDate),
        ),
      };
      while (currentRange.endDate < new Date(classEntity.recurringEndDate)) {
        dateRanges.push(currentRange);
        currentRange = {
          startDate: addWeeks(currentRange.startDate, 1),
          endDate: addWeeks(currentRange.endDate, 1),
        };
      }
      dateRanges.forEach((r, i) => {
        const concreteClass = classes[i];
        concreteClass.startDate = r.startDate;
        concreteClass.endDate = r.endDate;
      });
    }
    const a = omit(updateClassDto, ['updateType']);
    await this.classModel.bulkWrite(
      classes.map((c) => ({
        updateMany: {
          filter: { _id: c._id },
          update: {
            $set: {
              ...(a.name && { name: a.name }),
              ...(a.groupLink && { groupLink: a.groupLink }),
              ...(a.location && { location: a.location }),
              ...(a.city && { city: a.city }),
              ...(a.matnas && { matnas: a.matnas }),
              ...(a.teacherId && {
                teacherId: new Types.ObjectId(a.teacherId),
              }),
              startDate: c.startDate,
              endDate: c.endDate,
            },
          },
        },
      })),
    );
  }

  async updateFollowingRecurring(
    classEntity: ClassDto,
    updateClassDto: UpdateClassDto,
  ) {
    const classes = await this.classModel
      .find({
        classId: new Types.ObjectId(classEntity.classId),
        startDate: { $gte: new Date(classEntity.startDate) },
      })
      .sort({ startDate: 1 });
    if (updateClassDto.startDate && updateClassDto.endDate) {
      const dateRanges: { startDate: Date; endDate: Date }[] = [];
      let currentRange = {
        startDate: new Date(updateClassDto.startDate),
        endDate: new Date(updateClassDto.startDate),
      };
      while (currentRange.endDate < new Date(classEntity.recurringEndDate)) {
        dateRanges.push(currentRange);
        currentRange = {
          startDate: addWeeks(currentRange.startDate, 1),
          endDate: addWeeks(currentRange.endDate, 1),
        };
      }
      dateRanges.forEach((r, i) => {
        const concreteClass = classes[i];
        concreteClass.startDate = r.startDate;
        concreteClass.endDate = r.endDate;
      });
    }
    const a = omit(updateClassDto, ['updateType']);
    await this.classModel.bulkWrite(
      classes.map((c) => ({
        updateMany: {
          filter: { _id: c._id },
          update: {
            $set: {
              ...(a.name && { name: a.name }),
              ...(a.groupLink && { groupLink: a.groupLink }),
              ...(a.location && { location: a.location }),
              ...(a.city && { city: a.city }),
              ...(a.matnas && { matnas: a.matnas }),
              ...(a.teacherId && {
                teacherId: new Types.ObjectId(a.teacherId),
              }),
              startDate: c.startDate,
              endDate: c.endDate,
            },
          },
        },
      })),
    );
  }

  async update(classId: string, updateClassDto: UpdateClassDto) {
    const classEntity = await this.findOne(classId);
    if (classEntity.isRecurring) {
      if (updateClassDto.updateType === 'single') {
        return this.updateSingleRecurring(classId, updateClassDto);
      }
      if (updateClassDto.updateType === 'all') {
        return this.updateAllRecurring(classEntity, updateClassDto);
      }
      if (updateClassDto.updateType === 'following') {
        return this.updateFollowingRecurring(classEntity, updateClassDto);
      }
    }
    return this.updateSingleRecurring(classId, updateClassDto);
  }

  async removeSingleRecurring(classId: string) {
    await this.classModel.deleteOne({ _id: new Types.ObjectId(classId) });
  }

  async removeAllRecurring(classId: string) {
    await this.classModel.deleteMany({ classId: new Types.ObjectId(classId) });
  }

  async removeFollowingRecurring(classId: string, startDate: Date) {
    await this.classModel.deleteMany({
      classId: new Types.ObjectId(classId),
      startDate: { $gte: startDate },
    });
  }

  async remove(classId: string, deleteClassDto: DeleteClassDto) {
    const classEntity = await this.findOne(classId);
    if (classEntity.isRecurring) {
      if (deleteClassDto.deleteType === 'single') {
        return this.removeSingleRecurring(classId);
      }
      if (deleteClassDto.deleteType === 'all') {
        return this.removeAllRecurring(classEntity.classId.toString());
      }
      if (deleteClassDto.deleteType === 'following') {
        return this.removeFollowingRecurring(
          classEntity.classId.toString(),
          new Date(classEntity.startDate),
        );
      }
    }
    return this.removeSingleRecurring(classId);
  }

  async addStudentToSingleRecurring(classId: string, studentId: string) {
    await this.classModel.updateOne(
      { _id: new Types.ObjectId(classId) },
      { $addToSet: { studentsIds: studentId } },
    );
  }

  async addStudentToAllRecurring(classId: string, studentId: string) {
    await this.classModel.updateMany(
      { classId: new Types.ObjectId(classId) },
      { $addToSet: { studentsIds: studentId } },
    );
  }

  async addStudentToFollowingRecurring(
    classId: string,
    studentId: string,
    startDate: Date,
  ) {
    await this.classModel.updateMany(
      { classId: new Types.ObjectId(classId), startDate: { $gte: startDate } },
      { $addToSet: { studentsIds: studentId } },
    );
  }

  async addStudent(
    classId: string,
    studentId: string,
    addStudentToClassDto: AddStudentToClassDto,
  ) {
    const classEntity = await this.findOne(classId);
    if (classEntity.isRecurring) {
      if (addStudentToClassDto.updateType === 'single') {
        return this.addStudentToSingleRecurring(classId, studentId);
      }
      if (addStudentToClassDto.updateType === 'all') {
        return this.addStudentToAllRecurring(
          classEntity.classId.toString(),
          studentId,
        );
      }
      if (addStudentToClassDto.updateType === 'following') {
        return this.addStudentToFollowingRecurring(
          classEntity.classId.toString(),
          studentId,
          new Date(classEntity.startDate),
        );
      }
    }
    return this.addStudentToSingleRecurring(classId, studentId);
  }

  async removeStudentFromSingleRecurring(classId: string, studentId: string) {
    await this.classModel.updateOne(
      { _id: new Types.ObjectId(classId) },
      { $pull: { studentsIds: studentId } },
    );
  }

  async removeStudentFromAllRecurring(classId: string, studentId: string) {
    await this.classModel.updateMany(
      { classId: new Types.ObjectId(classId) },
      { $pull: { studentsIds: studentId } },
    );
  }

  async removeStudentFromFollowingRecurring(
    classId: string,
    studentId: string,
    startDate: Date,
  ) {
    await this.classModel.updateMany(
      { classId: new Types.ObjectId(classId), startDate: { $gte: startDate } },
      { $pull: { studentsIds: studentId } },
    );
  }

  async removeStudent(
    classId: string,
    studentId: string,
    removeStudentFromClassDto: RemoveStudentFromClassDto,
  ) {
    const classEntity = await this.findOne(classId);
    if (classEntity.isRecurring) {
      if (removeStudentFromClassDto.deleteType === 'single') {
        return this.removeStudentFromSingleRecurring(classId, studentId);
      }
      if (removeStudentFromClassDto.deleteType === 'all') {
        return this.removeStudentFromAllRecurring(
          classEntity.classId.toString(),
          studentId,
        );
      }
      if (removeStudentFromClassDto.deleteType === 'following') {
        return this.removeStudentFromFollowingRecurring(
          classEntity.classId.toString(),
          studentId,
          new Date(classEntity.startDate),
        );
      }
    }
    return this.removeStudentFromSingleRecurring(classId, studentId);
  }

  async getClassesStudentsPresence({
    startDate,
    endDate,
  }: GetStudentsPresenceQueryDto) {
    const classes = await this.classModel
      .find({
        $and: [
          startDate ? { startDate: { $gte: startDate } } : {},
          endDate ? { endDate: { $lte: endDate } } : {},
        ],
      })
      .select('_id studentsIds');
    const classStudentArray = classes.flatMap((c) =>
      c.studentsIds.map((sid) => ({
        classId: c._id,
        studentId: sid,
      })),
    );
    if (classStudentArray.length === 0) return null;
    const studentsCount = classStudentArray.length;
    const attendedStudentsCount = await this.studentClassPresenceModel
      .find({
        $or: classStudentArray,
      })
      .count();
    const present = (attendedStudentsCount / studentsCount) * 100;
    const absent = 100 - present;
    return {
      absent,
      present,
    };
  }

  async getStudentPresence(classId: string, studentId: string) {
    const presence = await this.studentClassPresenceModel.findOne({
      classId: new Types.ObjectId(classId),
      studentId: new Types.ObjectId(studentId),
    });
    return !!presence;
  }

  async addStudentPresence(classId: string, studentId: string) {
    const studentPresence = await this.getStudentPresence(classId, studentId);
    if (!studentPresence) {
      await this.studentClassPresenceModel.create({
        classId: new Types.ObjectId(classId),
        studentId: new Types.ObjectId(studentId),
      });
    }
  }

  async removeStudentPresence(classId: string, studentId: string) {
    await this.studentClassPresenceModel.deleteOne({
      classId: new Types.ObjectId(classId),
      studentId: new Types.ObjectId(studentId),
    });
  }

  async findFiles(classId: string) {
    const documents = await this.classFileRelationshipModel
      .find({
        classId: new Types.ObjectId(classId),
      })
      .select('fileId')
      .populate<{ fileId: ClassFileDocument }>({ path: 'fileId' });
    return documents.map((d) => d.fileId);
  }

  async findFile(classId: string, fileId: string) {
    const document = await this.classFileRelationshipModel
      .findOne({
        classId: new Types.ObjectId(classId),
        fileId: new Types.ObjectId(fileId),
      })
      .select('fileId')
      .populate<{ fileId: ClassFileDocument }>({ path: 'fileId' });
    return document.fileId;
  }

  private async uploadFileGenericFn(
    file: Express.Multer.File,
    uploadClassFileDto: UploadClassFileDto,
  ) {
    const classFile = await this.classFileModel.create({
      name: uploadClassFileDto.name,
      notes: uploadClassFileDto.notes,
    });
    const objectKey = `/classes/files/${classFile._id.toString()}.${file.originalname
      .split('.')
      .pop()}`;
    await this.S3Service.putObject({
      Key: objectKey,
      Body: file.buffer,
    });
    classFile.url = `${this.S3Service.baseBucketURI}${objectKey}`;
    return classFile.save();
  }

  async uploadFileForSingleRecurring(
    classId: string,
    file: Express.Multer.File,
    uploadClassFileDto: UploadClassFileDto,
  ) {
    const classFile = await this.uploadFileGenericFn(file, uploadClassFileDto);
    await this.classFileRelationshipModel.create({
      classId: new Types.ObjectId(classId),
      fileId: new Types.ObjectId(classFile._id.toString()),
    });
    return classFile;
  }

  async uploadFileForAllRecurring(
    classEntity: ClassDto,
    file: Express.Multer.File,
    uploadClassFileDto: UploadClassFileDto,
  ) {
    const classFile = await this.uploadFileGenericFn(file, uploadClassFileDto);
    const classes = await this.classModel.find({
      classId: new Types.ObjectId(classEntity.classId.toString()),
    });
    await this.classFileRelationshipModel.create(
      classes.map((c) => ({
        fileId: new Types.ObjectId(classFile._id.toString()),
        classId: new Types.ObjectId(c._id.toString()),
      })),
    );
    return classFile;
  }

  async uploadFileForFollowingRecurring(
    classEntity: ClassDto,
    file: Express.Multer.File,
    uploadClassFileDto: UploadClassFileDto,
  ) {
    const classFile = await this.uploadFileGenericFn(file, uploadClassFileDto);
    const classes = await this.classModel.find({
      classId: new Types.ObjectId(classEntity.classId.toString()),
      startDate: { $gte: new Date(classEntity.startDate) },
    });
    await this.classFileRelationshipModel.create(
      classes.map((c) => ({
        fileId: new Types.ObjectId(classFile._id.toString()),
        classId: new Types.ObjectId(c._id.toString()),
      })),
    );
    return classFile;
  }

  async uploadFile(
    classId: string,
    file: Express.Multer.File,
    uploadClassFileDto: UploadClassFileDto,
  ) {
    const classEntity = await this.findOne(classId);
    if (classEntity.isRecurring) {
      if (uploadClassFileDto.updateType === 'single') {
        return this.uploadFileForSingleRecurring(
          classId,
          file,
          uploadClassFileDto,
        );
      }
      if (uploadClassFileDto.updateType === 'all') {
        return this.uploadFileForAllRecurring(
          classEntity,
          file,
          uploadClassFileDto,
        );
      }
      if (uploadClassFileDto.updateType === 'following') {
        return this.uploadFileForFollowingRecurring(
          classEntity,
          file,
          uploadClassFileDto,
        );
      }
    }
    return this.uploadFileForSingleRecurring(classId, file, uploadClassFileDto);
  }

  async removeFileForSingleRecurring(classId: string, fileId: string) {
    await this.classFileRelationshipModel.deleteOne({
      classId: new Types.ObjectId(classId),
      fileId: new Types.ObjectId(fileId),
    });
    await this.removeFileIfNoRelationships(fileId);
  }

  async removeFileForAllRecurring(classEntity: ClassDto, fileId: string) {
    const classes = await this.classModel.find({
      classId: new Types.ObjectId(classEntity.classId.toString()),
    });
    await this.classFileRelationshipModel.deleteMany({
      classId: {
        $in: classes.map((c) => new Types.ObjectId(c._id.toString())),
      },
      fileId: new Types.ObjectId(fileId),
    });
    await this.removeFileIfNoRelationships(fileId);
  }

  async removeFileForFollowingRecurring(classEntity: ClassDto, fileId: string) {
    const classes = await this.classModel.find({
      classId: new Types.ObjectId(classEntity.classId.toString()),
      startDate: { $gte: new Date(classEntity.startDate) },
    });
    await this.classFileRelationshipModel.deleteMany({
      classId: {
        $in: classes.map((c) => new Types.ObjectId(c._id.toString())),
      },
      fileId: new Types.ObjectId(fileId),
    });
    await this.removeFileIfNoRelationships(fileId);
  }

  private async removeFileIfNoRelationships(fileId: string) {
    const classFileRelationshipsCount = await this.classFileRelationshipModel
      .find({
        fileId: new Types.ObjectId(fileId),
      })
      .count();
    if (classFileRelationshipsCount === 0) {
      const classFile = await this.classFileModel.findOne({
        _id: fileId,
      });
      await this.S3Service.deleteObjects({
        Keys: [classFile.url.replace(this.S3Service.baseBucketURI, '')],
      });
      await this.classFileModel.deleteOne({
        _id: fileId,
      });
    }
  }

  async deleteFile(
    classId: string,
    fileId: string,
    deleteClassFileDto: DeleteClassFileDto,
  ) {
    const classEntity = await this.findOne(classId);
    if (classEntity.isRecurring) {
      if (deleteClassFileDto.deleteType === 'single') {
        return this.removeFileForSingleRecurring(classId, fileId);
      }
      if (deleteClassFileDto.deleteType === 'all') {
        return this.removeFileForAllRecurring(classEntity, fileId);
      }
      if (deleteClassFileDto.deleteType === 'following') {
        return this.removeFileForFollowingRecurring(classEntity, fileId);
      }
    }
    return this.removeFileForSingleRecurring(classId, fileId);
  }

  async createNoteForSingleRecurring(classId: string, text: string) {
    const note = await this.classNoteModel.create({
      text,
    });
    await this.classNoteRelationshipModel.create({
      classId: new Types.ObjectId(classId),
      noteId: new Types.ObjectId(note._id.toString()),
    });
    return note;
  }

  async createNoteForAllRecurring(classEntity: ClassDto, text: string) {
    const note = await this.classNoteModel.create({
      text,
    });
    const classes = await this.classModel.find({
      classId: new Types.ObjectId(classEntity.classId.toString()),
    });
    await this.classNoteRelationshipModel.create(
      classes.map((c) => ({
        noteId: new Types.ObjectId(note._id.toString()),
        classId: new Types.ObjectId(c._id.toString()),
      })),
    );
    return note;
  }

  async createNoteForFollowingRecurring(classEntity: ClassDto, text: string) {
    const note = await this.classNoteModel.create({
      text,
    });
    const classes = await this.classModel.find({
      classId: new Types.ObjectId(classEntity.classId.toString()),
      startDate: { $gte: new Date(classEntity.startDate) },
    });
    await this.classNoteRelationshipModel.create(
      classes.map((c) => ({
        noteId: new Types.ObjectId(note._id.toString()),
        classId: new Types.ObjectId(c._id.toString()),
      })),
    );
    return note;
  }

  async createNote(classId: string, createClassNoteDto: CreateClassNoteDto) {
    const classEntity = await this.findOne(classId);
    if (classEntity.isRecurring) {
      if (createClassNoteDto.updateType === 'single') {
        return this.createNoteForSingleRecurring(
          classId,
          createClassNoteDto.text,
        );
      }
      if (createClassNoteDto.updateType === 'all') {
        return this.createNoteForAllRecurring(
          classEntity,
          createClassNoteDto.text,
        );
      }
      if (createClassNoteDto.updateType === 'following') {
        return this.createNoteForFollowingRecurring(
          classEntity,
          createClassNoteDto.text,
        );
      }
    }
    return this.createNoteForSingleRecurring(classId, createClassNoteDto.text);
  }

  async removeNoteForSingleRecurring(classId: string, noteId: string) {
    await this.classNoteRelationshipModel.deleteOne({
      classId: new Types.ObjectId(classId),
      noteId: new Types.ObjectId(noteId),
    });
    await this.removeNoteIfNoRelationships(noteId);
  }

  async removeNoteForAllRecurring(classEntity: ClassDto, noteId: string) {
    const classes = await this.classModel.find({
      classId: new Types.ObjectId(classEntity.classId.toString()),
    });
    await this.classNoteRelationshipModel.deleteMany({
      classId: {
        $in: classes.map((c) => new Types.ObjectId(c._id.toString())),
      },
      noteId: new Types.ObjectId(noteId),
    });
    await this.removeNoteIfNoRelationships(noteId);
  }

  async removeNoteForFollowingRecurring(classEntity: ClassDto, noteId: string) {
    const classes = await this.classModel.find({
      classId: new Types.ObjectId(classEntity.classId.toString()),
      startDate: { $gte: new Date(classEntity.startDate) },
    });
    await this.classNoteRelationshipModel.deleteMany({
      classId: {
        $in: classes.map((c) => new Types.ObjectId(c._id.toString())),
      },
      noteId: new Types.ObjectId(noteId),
    });
    await this.removeNoteIfNoRelationships(noteId);
  }

  private async removeNoteIfNoRelationships(noteId: string) {
    const classNoteRelationshipsCount = await this.classNoteRelationshipModel
      .find({
        noteId: new Types.ObjectId(noteId),
      })
      .count();
    if (classNoteRelationshipsCount === 0) {
      await this.classNoteModel.deleteOne({ _id: new Types.ObjectId(noteId) });
    }
  }

  async removeNote(
    classId: string,
    noteId: string,
    deleteClassNoteDto: DeleteClassNoteDto,
  ) {
    const classEntity = await this.findOne(classId);
    if (classEntity.isRecurring) {
      if (deleteClassNoteDto.deleteType === 'single') {
        return this.removeNoteForSingleRecurring(classId, noteId);
      }
      if (deleteClassNoteDto.deleteType === 'all') {
        return this.removeNoteForAllRecurring(classEntity, noteId);
      }
      if (deleteClassNoteDto.deleteType === 'following') {
        return this.removeNoteForFollowingRecurring(classEntity, noteId);
      }
    }
    return this.removeNoteForSingleRecurring(classId, noteId);
  }

  async getNotes(classId: string) {
    const documents = await this.classNoteRelationshipModel
      .find({
        classId: new Types.ObjectId(classId),
      })
      .select('-classId')
      .populate<{ noteId: ClassNoteDocument }>({ path: 'noteId' });
    return documents.map((d) => d.noteId);
  }

  async getStudents(classId: string) {
    const classEntity = await this.classModel
      .findById(classId)
      .select('studentsIds')
      .populate({ path: 'studentsIds' });
    return classEntity.studentsIds;
  }
}
