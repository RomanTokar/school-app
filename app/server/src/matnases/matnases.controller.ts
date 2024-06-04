import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MatnasesService } from './matnases.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { MatnasDto } from './dto/matnas.dto';
import { CreateMatnasDto } from './dto/create-matnas.dto';

@ApiTags('Matnases')
@ApiBearerAuth()
@Controller('matnases')
export class MatnasesController {
  constructor(private readonly matnasesService: MatnasesService) {}

  @ApiCreatedResponse({
    type: MatnasDto,
  })
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(@Body() createMatnasDto: CreateMatnasDto) {
    const matnas = await this.matnasesService.findByName(createMatnasDto.name);
    if (matnas) {
      throw new BadRequestException('Matnas with this name already exists');
    }
    return this.matnasesService.create(createMatnasDto);
  }

  @ApiCreatedResponse({
    type: [MatnasDto],
  })
  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll() {
    return this.matnasesService.findAll();
  }
}
