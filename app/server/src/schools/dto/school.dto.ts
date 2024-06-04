import { IntersectionType } from '@nestjs/swagger';
import { MongodbIdDto } from '../../dto/mongodb-id.dto';
import { CreateSchoolDto } from './create-school.dto';

export class SchoolDto extends IntersectionType(
  CreateSchoolDto,
  MongodbIdDto,
) {}
