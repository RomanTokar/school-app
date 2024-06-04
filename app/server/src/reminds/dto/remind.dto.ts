import { CreateRemindDto } from './create-remind.dto';
import { IntersectionType } from '@nestjs/swagger';
import { MongodbIdDto } from '../../dto/mongodb-id.dto';

export class RemindDto extends IntersectionType(
  CreateRemindDto,
  MongodbIdDto,
) {}
