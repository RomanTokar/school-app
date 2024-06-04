import { ApiProperty, IntersectionType, OmitType } from '@nestjs/swagger';
import { CreateTeacherDto } from './create-teacher.dto';
import { MongodbIdDto } from '../../dto/mongodb-id.dto';
import { IsInt, IsString } from 'class-validator';

export class TeacherDto extends IntersectionType(
  OmitType(CreateTeacherDto, ['password']),
  MongodbIdDto,
) {
  @ApiProperty({ example: 3 })
  @IsInt()
  classesCount: number;

  @ApiProperty({ example: 'avatar url', nullable: true })
  @IsString()
  avatar: string;
}
