import { IntersectionType } from '@nestjs/swagger';
import { MongodbIdDto } from '../../dto/mongodb-id.dto';
import { CreateMatnasDto } from './create-matnas.dto';

export class MatnasDto extends IntersectionType(
  CreateMatnasDto,
  MongodbIdDto,
) {}
