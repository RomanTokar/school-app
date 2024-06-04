import { MongodbIdDto } from '../../dto/mongodb-id.dto';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { UploadTeacherFileDto } from './upload-teacher-file.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class TeacherFileDto extends IntersectionType(
  UploadTeacherFileDto,
  MongodbIdDto,
) {
  @ApiProperty({ example: 'File url' })
  @IsString()
  @IsNotEmpty()
  url: string;
}
