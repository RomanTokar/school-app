import { IntersectionType } from '@nestjs/swagger';
import { MongodbIdDto } from '../../dto/mongodb-id.dto';
import { CreateCityDto } from './create-city.dto';

export class CityDto extends IntersectionType(CreateCityDto, MongodbIdDto) {}
