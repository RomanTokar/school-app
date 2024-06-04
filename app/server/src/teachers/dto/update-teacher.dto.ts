import { CreateTeacherDto } from './create-teacher.dto';
import { OmitType, PartialType } from '@nestjs/swagger';

export class UpdateTeacherDto extends PartialType(
  OmitType(CreateTeacherDto, ['password']),
) {}
