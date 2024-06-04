import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CitiesService } from './cities.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CityDto } from './dto/city.dto';
import { CreateCityDto } from './dto/create-city.dto';

@ApiTags('Cities')
@ApiBearerAuth()
@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @ApiCreatedResponse({
    type: CityDto,
  })
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(@Body() createCityDto: CreateCityDto) {
    const city = await this.citiesService.findByName(createCityDto.name);
    if (city) {
      throw new BadRequestException('City with this name already exists');
    }
    return this.citiesService.create(createCityDto);
  }

  @ApiCreatedResponse({
    type: [CityDto],
  })
  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll() {
    return this.citiesService.findAll();
  }
}
