import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StudentDto } from './dto/student.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CreateStudentNoteDto } from './dto/create-student-note.dto';
import { StudentNoteDto } from './dto/student-note.dto';
import { GetStudentsQueryDto } from './dto/get-students-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import imageFileFilter from '../helpers/imageFileFilter';
import { MatnasesService } from '../matnases/matnases.service';
import { SchoolsService } from '../schools/schools.service';
import { CitiesService } from '../cities/cities.service';
import { ClassDto } from '../classes/dto/class.dto';
import { GetStudentClassesQueryDto } from './dto/get-student-classes-query.dto';
import { TeacherFileDto } from '../teachers/dto/teacher-file.dto';
import { StudentFileDto } from './dto/student-file.dto';
import { UploadStudentFileDto } from './dto/upload-student-file.dto';
import { StudentPresenceDto } from './dto/student-presence.dto';
import { GetStudentPresenceQueryDto } from './dto/get-student-presence-query.dto';

@ApiTags('Students')
@ApiBearerAuth()
@Controller('students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly matnasesService: MatnasesService,
    private readonly schoolsService: SchoolsService,
    private readonly citiesService: CitiesService,
  ) {}

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(@Body() createStudentDto: CreateStudentDto) {
    const [matnas, school, city] = await Promise.all([
      createStudentDto.matnas
        ? this.matnasesService.findByName(createStudentDto.matnas)
        : undefined,
      createStudentDto.school
        ? this.schoolsService.findByName(createStudentDto.school)
        : undefined,
      this.citiesService.findByName(createStudentDto.city),
    ]);
    if (!matnas && createStudentDto.matnas)
      throw new BadRequestException('Matnas not found');
    if (!school && createStudentDto.school)
      throw new BadRequestException('School not found');
    if (!city) throw new BadRequestException('City not found');
    return this.studentsService.create(createStudentDto);
  }

  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiCreatedResponse({
    type: [StudentDto],
  })
  @Get()
  findAll(
    @Query()
    getStudentsQueryDto: GetStudentsQueryDto,
  ) {
    return this.studentsService.findAll(getStudentsQueryDto);
  }

  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiCreatedResponse({
    type: StudentDto,
  })
  @Get(':id')
  async findOne(@Param('id') studentId: string) {
    const student = await this.studentsService.findOne(studentId);
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async update(
    @Param('id') studentId: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    await this.findOne(studentId);
    const [matnas, school, city] = await Promise.all([
      updateStudentDto.matnas
        ? this.matnasesService.findByName(updateStudentDto.matnas)
        : undefined,
      updateStudentDto.school
        ? this.schoolsService.findByName(updateStudentDto.school)
        : undefined,
      updateStudentDto.city
        ? this.citiesService.findByName(updateStudentDto.city)
        : undefined,
    ]);
    if (!matnas && updateStudentDto.matnas)
      throw new BadRequestException('Matnas not found');
    if (!school && updateStudentDto.school)
      throw new BadRequestException('School not found');
    if (!city && updateStudentDto.city)
      throw new BadRequestException('City not found');
    return this.studentsService.update(studentId, updateStudentDto);
  }

  @Delete(':id')
  async remove(@Param('id') studentId: string) {
    await this.findOne(studentId);
    await this.studentsService.remove(studentId);
    await this.studentsService.removeStudentFromClasses(studentId);
    await this.studentsService.removeNotes(studentId);
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
    @Param('id') studentId: string,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    await this.findOne(studentId);
    return this.studentsService.uploadAvatar(studentId, avatar);
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id/avatar')
  async deleteAvatar(@Param('id') studentId: string) {
    await this.findOne(studentId);
    return this.studentsService.deleteAvatar(studentId);
  }

  async findStudentFile(teacherId: string, fileId: string) {
    const teacherFile = await this.studentsService.findFile(teacherId, fileId);
    if (!teacherFile) throw new NotFoundException('Student file not found');
    return teacherFile;
  }

  @ApiCreatedResponse({
    type: StudentPresenceDto,
  })
  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/presence')
  async getStudentPresence(
    @Param('id') studentId: string,
    @Query() getStudentPresenceQueryDto: GetStudentPresenceQueryDto,
  ) {
    await this.findOne(studentId);
    return this.studentsService.getStudentPresence(
      studentId,
      getStudentPresenceQueryDto,
    );
  }

  @ApiCreatedResponse({
    type: [StudentFileDto],
  })
  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/files')
  async getFiles(@Param('id') studentId: string) {
    await this.findOne(studentId);
    return this.studentsService.findFiles(studentId);
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
    @Param('id') studentId: string,
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
    @Body() uploadStudentFileDto: UploadStudentFileDto,
  ) {
    await this.findOne(studentId);
    return this.studentsService.uploadFile(
      studentId,
      file,
      uploadStudentFileDto,
    );
  }

  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':studentId/files/:fileId')
  async deleteFile(
    @Param('studentId') studentId: string,
    @Param('fileId') fileId: string,
  ) {
    await this.findOne(studentId);
    await this.findStudentFile(studentId, fileId);
    return this.studentsService.deleteFile(studentId, fileId);
  }

  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/notes')
  async createNote(
    @Param('id') studentId: string,
    @Body() createStudentNoteDto: CreateStudentNoteDto,
  ) {
    await this.findOne(studentId);
    return this.studentsService.createNote(studentId, createStudentNoteDto);
  }

  @ApiCreatedResponse({
    type: [StudentNoteDto],
  })
  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/notes')
  async getNotes(@Param('id') studentId: string) {
    await this.findOne(studentId);
    return this.studentsService.getNotes(studentId);
  }

  @ApiCreatedResponse({
    type: [ClassDto],
  })
  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/classes')
  async getClasses(
    @Param('id') studentId: string,
    @Query()
    getStudentClassesQueryDto: GetStudentClassesQueryDto,
  ) {
    await this.findOne(studentId);
    return this.studentsService.getClasses(
      studentId,
      getStudentClassesQueryDto,
    );
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':studentId/notes/:noteId')
  async deleteNote(
    @Param('studentId') studentId: string,
    @Param('noteId') noteId: string,
  ) {
    await this.findOne(studentId);
    return this.studentsService.removeNote(studentId, noteId);
  }
}
