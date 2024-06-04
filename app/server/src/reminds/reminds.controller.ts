import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RemindsService } from './reminds.service';
import { CreateRemindDto } from './dto/create-remind.dto';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { RemindDto } from './dto/remind.dto';
import { CurrentUser } from '../param-decorators/current-user';
import { GetRemindsQueryDto } from './dto/get-reminds-query.dto';

@ApiTags('Reminds')
@ApiBearerAuth()
@Controller('reminds')
export class RemindsController {
  constructor(private readonly remindsService: RemindsService) {}

  @ApiCreatedResponse({
    type: RemindDto,
  })
  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(@CurrentUser() user, @Body() createRemindDto: CreateRemindDto) {
    return this.remindsService.create({ userId: user._id, ...createRemindDto });
  }

  @ApiCreatedResponse({
    type: [RemindDto],
  })
  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(
    @CurrentUser() user,
    @Query() getRemindsQueryDto: GetRemindsQueryDto,
  ) {
    return this.remindsService.findAll(user._id, getRemindsQueryDto);
  }

  @Roles(Role.Admin, Role.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async remove(@CurrentUser() user, @Param('id') id: string) {
    const remind = await this.remindsService.findOne(id);
    if (!remind) throw new BadRequestException('Remind not found');
    if (remind.userId.toString() !== user._id) {
      throw new BadRequestException('Remind does not belong to this user');
    }
    return this.remindsService.remove(id);
  }
}
