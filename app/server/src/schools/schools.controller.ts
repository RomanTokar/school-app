import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { SchoolDto } from './dto/school.dto';
import { CreateSchoolDto } from './dto/create-school.dto';

@ApiTags('Schools')
@ApiBearerAuth()
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @ApiCreatedResponse({
    type: SchoolDto,
  })
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(@Body() createSchoolDto: CreateSchoolDto) {
    const school = await this.schoolsService.findByName(createSchoolDto.name);
    if (school) {
      throw new BadRequestException('School with this name already exists');
    }
    return this.schoolsService.create(createSchoolDto);
  }

  @ApiCreatedResponse({
    type: [SchoolDto],
  })
  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll() {
    return this.schoolsService.findAll();
  }
}
