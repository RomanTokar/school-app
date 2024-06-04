import { MongodbIdDto } from '../../dto/mongodb-id.dto';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { UploadStudentFileDto } from './upload-student-file.dto';

export class StudentFileDto extends IntersectionType(
  UploadStudentFileDto,
  MongodbIdDto,
) {
  @ApiProperty({ example: 'File url' })
  @IsString()
  @IsNotEmpty()
  url: string;
}
