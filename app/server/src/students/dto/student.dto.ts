import { CreateStudentDto } from './create-student.dto';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { MongodbIdDto } from '../../dto/mongodb-id.dto';
import { IsInt, IsString } from 'class-validator';

export class StudentDto extends IntersectionType(
  CreateStudentDto,
  MongodbIdDto,
) {
  @ApiProperty({ example: 3 })
  @IsInt()
  classesCount: number;

  @ApiProperty({ example: 'avatar url', nullable: true })
  @IsString()
  avatar: string;
}
