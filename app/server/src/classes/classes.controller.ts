import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { isAfter, isBefore, isSameDay } from 'date-fns';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CitiesService } from '../cities/cities.service';
import { MatnasesService } from '../matnases/matnases.service';
import { CurrentUser } from '../param-decorators/current-user';
import { StudentDto } from '../students/dto/student.dto';
import { StudentsService } from '../students/students.service';
import { TeachersService } from '../teachers/teachers.service';
import { ClassesService } from './classes.service';
import { AddStudentToClassDto } from './dto/add-student-to-class.dto';
import { ClassFileDto } from './dto/class-file.dto';
import { ClassNoteDto } from './dto/class-note.dto';
import { ClassDto } from './dto/class.dto';
import { CreateClassNoteDto } from './dto/create-class-note.dto';
import { CreateClassDto } from './dto/create-class.dto';
import { DeleteClassFileDto } from './dto/delete-class-file.dto';
import { DeleteClassNoteDto } from './dto/delete-class-note.dto';
import { DeleteClassDto } from './dto/delete-class.dto';
import { GetClassesQueryDto } from './dto/get-classes-query.dto';
import { GetStudentsPresenceQueryDto } from './dto/get-students-presence-query.dto';
import { RemoveStudentFromClassDto } from './dto/remove-student-from-class.dto';
import { StudentsPresenceDto } from './dto/students-presence.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { UploadClassFileDto } from './dto/upload-class-file.dto';

@ApiTags('Classes')
@ApiBearerAuth()
@Controller('classes')
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    private readonly teachersService: TeachersService,
    private readonly studentsService: StudentsService,
    private readonly matnasesService: MatnasesService,
    private readonly citiesService: CitiesService,
  ) {}

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(@Body() createClassDto: CreateClassDto) {
    this.checkSameDay(createClassDto.startDate, createClassDto.endDate);
    const teacher = await this.teachersService.findOne(
      createClassDto.teacherId,
    );
    if (!teacher) throw new BadRequestException('Teacher not found');
    const [matnas, city] = await Promise.all([
      this.matnasesService.findByName(createClassDto.matnas),
      this.citiesService.findByName(createClassDto.city),
    ]);
    if (!matnas) throw new BadRequestException('Matnas not found');
    if (!city) throw new BadRequestException('City not found');
    await this.checkOverlap(
      createClassDto.teacherId,
      createClassDto.startDate,
      createClassDto.endDate,
    );
    return this.classesService.create(createClassDto);
  }

  @ApiCreatedResponse({
    type: [ClassDto],
  })
  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(
    @CurrentUser() user,
    @Query()
    getClassesQueryDto: GetClassesQueryDto,
  ) {
    if (user.role === Role.Admin) {
      return this.classesService.findAll(getClassesQueryDto);
    }

    if (user.role === Role.Teacher) {
      const teacher = await this.teachersService.findOneByUserId(user._id);
      if (
        !!getClassesQueryDto.teacherId &&
        getClassesQueryDto.teacherId !== teacher._id.toString()
      ) {
        throw new ForbiddenException('You can only get your classes');
      }

      return this.classesService.findAll({
        ...getClassesQueryDto,
        teacherId: teacher._id.toString(),
      });
    }
  }

  @ApiCreatedResponse({
    type: ClassDto,
  })
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async findOne(@Param('id') classId: string) {
    const classEntity = await this.classesService.findOne(classId);
    if (!classEntity) throw new NotFoundException('Class not found');
    return this.classesService.findOne(classId);
  }

  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async update(
    @Param('id') classId: string,
    @Body() updateClassDto: UpdateClassDto,
  ) {
    const classEntity = await this.findOne(classId);

    if (classEntity.isRecurring) {
      if (!updateClassDto.updateType) {
        throw new BadRequestException(
          'updateType is required to update a recurring class',
        );
      }
    }

    if (updateClassDto.teacherId) {
      const teacher = await this.teachersService.findOne(
        updateClassDto.teacherId,
      );
      if (!teacher) throw new BadRequestException('Teacher not found');
    }

    const [matnas, city] = await Promise.all([
      updateClassDto.matnas
        ? this.matnasesService.findByName(updateClassDto.matnas)
        : undefined,
      updateClassDto.city
        ? this.citiesService.findByName(updateClassDto.city)
        : undefined,
    ]);
    if (!matnas && updateClassDto.matnas)
      throw new BadRequestException('Matnas not found');
    if (!city && updateClassDto.city)
      throw new BadRequestException('City not found');

    if (updateClassDto.startDate && updateClassDto.endDate) {
      this.checkSameDay(updateClassDto.startDate, updateClassDto.endDate);
      if (
        !isSameDay(
          new Date(updateClassDto.startDate),
          new Date(classEntity.startDate),
        ) &&
        updateClassDto.updateType === 'all'
      ) {
        throw new BadRequestException(
          'cannot update all recurring classes that have startDate and endDate which are not on the same day as the original class',
        );
      }
    }

    if (
      (updateClassDto.startDate && updateClassDto.endDate) ||
      updateClassDto.teacherId
    ) {
      await this.checkOverlap(
        updateClassDto.teacherId || classEntity.teacher._id.toString(),
        updateClassDto.startDate || classEntity.startDate,
        updateClassDto.endDate || classEntity.endDate,
      );
    }

    return this.classesService.update(classId, updateClassDto);
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async remove(
    @Param('id') classId: string,
    @Body() deleteClassDto: DeleteClassDto,
  ) {
    const classEntity = await this.findOne(classId);
    if (classEntity.isRecurring) {
      if (!deleteClassDto.deleteType) {
        throw new BadRequestException(
          'deleteType is required to remove a recurring class',
        );
      }
    }
    return this.classesService.remove(classId, deleteClassDto);
  }

  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':classId/students/:studentId')
  async addStudent(
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
    @Body() addStudentToClassDto: AddStudentToClassDto,
  ) {
    const classEntity = await this.findOne(classId);
    const student = await this.studentsService.findOne(studentId);
    if (!student) throw new NotFoundException('Student not found');
    if (classEntity.isRecurring) {
      if (!addStudentToClassDto.updateType) {
        throw new BadRequestException(
          'updateType is required to add a student to recurring classes',
        );
      }
    }
    return this.classesService.addStudent(
      classId,
      studentId,
      addStudentToClassDto,
    );
  }

  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':classId/students/:studentId')
  async removeStudent(
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
    @Body() removeStudentFromClassDto: RemoveStudentFromClassDto,
  ) {
    const classEntity = await this.findOne(classId);
    if (classEntity.isRecurring) {
      if (!removeStudentFromClassDto.deleteType) {
        throw new BadRequestException(
          'deleteType is required to remove a student from recurring classes',
        );
      }
    }
    return this.classesService.removeStudent(
      classId,
      studentId,
      removeStudentFromClassDto,
    );
  }

  @ApiCreatedResponse({
    type: StudentsPresenceDto,
  })
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/students/presence')
  async getStudentsPresence(
    @Query() getStudentsPresenceQueryDto: GetStudentsPresenceQueryDto,
  ) {
    return this.classesService.getClassesStudentsPresence(
      getStudentsPresenceQueryDto,
    );
  }

  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':classId/students/:studentId/presence')
  async getStudentPresence(
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
  ) {
    await this.findOne(classId);
    const student = await this.studentsService.findOne(studentId);
    if (!student) throw new NotFoundException('Student not found');
    return this.classesService.getStudentPresence(classId, studentId);
  }

  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':classId/students/:studentId/presence')
  async addStudentPresence(
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
  ) {
    await this.findOne(classId);
    const student = await this.studentsService.findOne(studentId);
    if (!student) throw new NotFoundException('Student not found');
    return this.classesService.addStudentPresence(classId, studentId);
  }

  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':classId/students/:studentId/presence')
  async removeStudentPresence(
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
  ) {
    await this.findOne(classId);
    return this.classesService.removeStudentPresence(classId, studentId);
  }

  async findClassFile(classId: string, fileId: string) {
    const classFile = await this.classesService.findFile(classId, fileId);
    if (!classFile) throw new NotFoundException('Class file not found');
    return classFile;
  }

  @ApiCreatedResponse({
    type: [ClassFileDto],
  })
  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/files')
  async getFiles(@Param('id') classId: string) {
    await this.findOne(classId);
    return this.classesService.findFiles(classId);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        name: {
          type: 'string',
        },
        notes: {
          type: 'string',
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: [ClassFileDto],
  })
  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Put(':id/files')
  async uploadFile(
    @Param('id') classId: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 300,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Body() uploadClassFileDto: UploadClassFileDto,
  ) {
    const classEntity = await this.findOne(classId);
    if (classEntity.isRecurring) {
      if (!uploadClassFileDto.updateType) {
        throw new BadRequestException(
          'updateType is required to upload a file for recurring classes',
        );
      }
    }
    return this.classesService.uploadFile(classId, file, uploadClassFileDto);
  }

  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':classId/files/:fileId')
  async deleteFile(
    @Param('classId') classId: string,
    @Param('fileId') fileId: string,
    @Body() deleteClassFileDto: DeleteClassFileDto,
  ) {
    const classEntity = await this.findOne(classId);
    await this.findClassFile(classId, fileId);
    if (classEntity.isRecurring) {
      if (!deleteClassFileDto.deleteType) {
        throw new BadRequestException(
          'deleteType is required to remove a file from recurring classes',
        );
      }
    }
    return this.classesService.deleteFile(classId, fileId, deleteClassFileDto);
  }

  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/notes')
  async createNote(
    @Param('id') classId: string,
    @Body() createClassNoteDto: CreateClassNoteDto,
  ) {
    const classEntity = await this.findOne(classId);
    if (classEntity.isRecurring) {
      if (!createClassNoteDto.updateType) {
        throw new BadRequestException(
          'updateType is required to create a note for recurring classes',
        );
      }
    }
    return this.classesService.createNote(classId, createClassNoteDto);
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':classId/notes/:noteId')
  async deleteNote(
    @Param('classId') classId: string,
    @Param('noteId') noteId: string,
    @Body() deleteClassNoteDto: DeleteClassNoteDto,
  ) {
    const classEntity = await this.findOne(classId);
    if (classEntity.isRecurring) {
      if (!deleteClassNoteDto.deleteType) {
        throw new BadRequestException(
          'deleteType is required to remove a note from recurring classes',
        );
      }
    }
    return this.classesService.removeNote(classId, noteId, deleteClassNoteDto);
  }

  @ApiCreatedResponse({
    type: [ClassNoteDto],
  })
  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/notes')
  async getNotes(@Param('id') classId: string) {
    await this.findOne(classId);
    return this.classesService.getNotes(classId);
  }

  @ApiCreatedResponse({
    type: [StudentDto],
  })
  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/students')
  async getStudents(@Param('id') classId: string) {
    await this.findOne(classId);
    return this.classesService.getStudents(classId);
  }

  async checkOverlap(teacherId: string, startDate: string, endDate: string) {
    const classes = await this.classesService.findAll({
      teacherId: teacherId,
    });
    if (
      !classes.every(
        (c) =>
          isAfter(new Date(startDate), c.endDate) ||
          isBefore(new Date(endDate), c.startDate),
      )
    ) {
      throw new BadRequestException(
        'Class startDate and endDate overlap with another class of this teacher',
      );
    }
  }

  checkSameDay(startDate: string, endDate: string) {
    if (!isSameDay(new Date(startDate), new Date(endDate))) {
      throw new BadRequestException(
        'Class startDate and endDate must be the same day',
      );
    }
  }
}
