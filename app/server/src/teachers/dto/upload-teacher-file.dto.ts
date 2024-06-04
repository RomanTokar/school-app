import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadTeacherFileDto {
  @ApiProperty({ example: 'File name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Notes' })
  @IsString()
  notes: string;
}
