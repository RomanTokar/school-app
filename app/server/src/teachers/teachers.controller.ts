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
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { UsersService } from '../users/users.service';
import { pick } from 'lodash';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TeacherDto } from './dto/teacher.dto';
import { CreateTeacherNoteDto } from './dto/create-teacher-note.dto';
import { TeacherNoteDto } from './dto/teacher-note.dto';
import * as bcrypt from 'bcrypt';
import { GetTeachersQueryDto } from './dto/get-teachers-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import imageFileFilter from '../helpers/imageFileFilter';
import { StudentDto } from '../students/dto/student.dto';
import { UploadTeacherFileDto } from './dto/upload-teacher-file.dto';
import { TeacherFileDto } from './dto/teacher-file.dto';
import { CurrentUser } from '../param-decorators/current-user';

@ApiTags('Teachers')
@ApiBearerAuth()
@Controller('teachers')
export class TeachersController {
  constructor(
    private readonly teachersService: TeachersService,
    private readonly usersService: UsersService,
  ) {}

  @ApiCreatedResponse({
    type: TeacherDto,
  })
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(
    @Body() createTeacherDto: CreateTeacherDto,
  ): Promise<TeacherDto> {
    const [userByEmail, userByPhoneNumber] = await Promise.all([
      this.usersService.findUserByEmail(createTeacherDto.email),
      this.usersService.findUserByPhoneNumber(createTeacherDto.phoneNumber),
    ]);
    if (userByEmail || userByPhoneNumber)
      throw new BadRequestException('User Already Exists');
    const hashedPassword = await bcrypt.hash(createTeacherDto.password, 10);
    const user = await this.usersService.create({
      ...pick(createTeacherDto, ['email', 'phoneNumber']),
      password: hashedPassword,
      role: Role.Teacher,
    });
    const teacher = await this.teachersService.create({
      ...pick(createTeacherDto, ['fullName']),
      userId: user.id,
    });
    return {
      ...pick(user, ['email', 'phoneNumber']),
      ...pick(teacher, ['fullName', 'avatar']),
      _id: teacher._id.toString(),
      classesCount: 0,
    };
  }

  @ApiCreatedResponse({
    type: [TeacherDto],
  })
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll(
    @Query()
    getTeachersQueryDto: GetTeachersQueryDto,
  ) {
    return this.teachersService.findAll(getTeachersQueryDto);
  }

  @ApiCreatedResponse({
    type: TeacherDto,
  })
  @Get(':id')
  async findOneWithUserPopulation(@Param('id') teacherId: string) {
    const teacher = await this.teachersService.findOneWithUserPopulation(
      teacherId,
    );
    if (!teacher) throw new NotFoundException('Teacher not found');
    return teacher;
  }

  async findOne(teacherId: string) {
    const teacher = await this.teachersService.findOne(teacherId);
    if (!teacher) throw new NotFoundException('Teacher not found');
    return teacher;
  }

  async findTeacherFile(teacherId: string, fileId: string) {
    const teacherFile = await this.teachersService.findTeacherFile(
      teacherId,
      fileId,
    );
    if (!teacherFile) throw new NotFoundException('Teacher file not found');
    return teacherFile;
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async update(
    @Param('id') teacherId: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ) {
    await this.findOne(teacherId);
    const updatedTeacher = await this.teachersService.update(
      teacherId,
      updateTeacherDto,
    );
    const updatedUser = await this.usersService.update(
      updatedTeacher.userId.toString(),
      pick<UpdateTeacherDto, 'email' | 'phoneNumber'>(updateTeacherDto, [
        'email',
        'phoneNumber',
      ]),
    );
    if (!updatedUser) throw new BadRequestException('User not found');
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async remove(@Param('id') teacherId: string) {
    const teacher = await this.findOne(teacherId);
    await this.teachersService.remove(teacherId);
    await this.usersService.remove(teacher.userId.toString());
    await this.teachersService.removeNotes(teacherId);
    await this.teachersService.removeTeacherFromClasses(teacherId);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('avatar', { fileFilter: imageFileFilter }))
  @Put(':id/avatar')
  async uploadAvatar(
    @Param('id') teacherId: string,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    await this.findOne(teacherId);
    return this.teachersService.uploadAvatar(teacherId, avatar);
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id/avatar')
  async deleteAvatar(@Param('id') teacherId: string) {
    await this.findOne(teacherId);
    return this.teachersService.deleteAvatar(teacherId);
  }

  @ApiCreatedResponse({
    type: [TeacherFileDto],
  })
  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/files')
  async getFiles(@CurrentUser() user, @Param('id') teacherId: string) {
    const getTeacherFilesFn = async () => {
      await this.findOne(teacherId);
      return this.teachersService.findTeacherFiles(teacherId);
    };
    if (user.role === Role.Admin) {
      return getTeacherFilesFn();
    }

    if (user.role === Role.Teacher) {
      const teacher = await this.teachersService.findOneByUserId(user._id);
      if (teacherId !== teacher._id.toString()) {
        throw new ForbiddenException('You can only get your files');
      }
      return getTeacherFilesFn();
    }
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
    type: [TeacherFileDto],
  })
  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Put(':id/files')
  async uploadFile(
    @Param('id') teacherId: string,
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
    @CurrentUser() user,
    @Body() uploadTeacherFileDto: UploadTeacherFileDto,
  ) {
    const uploadFileFn = async () => {
      await this.findOne(teacherId);
      return this.teachersService.uploadFile(
        teacherId,
        file,
        uploadTeacherFileDto,
      );
    };
    if (user.role === Role.Admin) {
      return uploadFileFn();
    }

    if (user.role === Role.Teacher) {
      const teacher = await this.teachersService.findOneByUserId(user._id);
      if (teacherId !== teacher._id.toString()) {
        throw new ForbiddenException('You can only upload your file');
      }
      return uploadFileFn();
    }
  }

  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':teacherId/files/:fileId')
  async deleteFile(
    @CurrentUser() user,
    @Param('teacherId') teacherId: string,
    @Param('fileId') fileId: string,
  ) {
    const deleteFileFn = async () => {
      await this.findOne(teacherId);
      await this.findTeacherFile(teacherId, fileId);
      return this.teachersService.deleteFile(teacherId, fileId);
    };
    if (user.role === Role.Admin) {
      return deleteFileFn();
    }

    if (user.role === Role.Teacher) {
      const teacher = await this.teachersService.findOneByUserId(user._id);
      if (teacherId !== teacher._id.toString()) {
        throw new ForbiddenException('You can only remove your files');
      }
      return deleteFileFn();
    }
  }

  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/notes')
  async createNote(
    @Param('id') teacherId: string,
    @Body() createTeacherNoteDto: CreateTeacherNoteDto,
  ) {
    await this.findOne(teacherId);
    return this.teachersService.createNote(teacherId, createTeacherNoteDto);
  }

  @ApiCreatedResponse({
    type: [TeacherNoteDto],
  })
  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/notes')
  async getNotes(@Param('id') teacherId: string) {
    await this.findOne(teacherId);
    return this.teachersService.getNotes(teacherId);
  }

  @ApiCreatedResponse({
    type: [StudentDto],
  })
  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/students')
  async getStudents(@Param('id') teacherId: string) {
    await this.findOne(teacherId);
    return this.teachersService.getStudents(teacherId);
  }

  @ApiCreatedResponse({
    type: Number,
  })
  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/students-number')
  async getNumberOfStudents(@Param('id') teacherId: string) {
    await this.findOne(teacherId);
    return this.teachersService.getNumberOfStudents(teacherId);
  }
}
