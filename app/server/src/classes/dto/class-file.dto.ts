import { MongodbIdDto } from '../../dto/mongodb-id.dto';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { UploadClassFileDto } from './upload-class-file.dto';

export class ClassFileDto extends IntersectionType(
  UploadClassFileDto,
  MongodbIdDto,
) {
  @ApiProperty({ example: 'File url' })
  @IsString()
  @IsNotEmpty()
  url: string;
}
