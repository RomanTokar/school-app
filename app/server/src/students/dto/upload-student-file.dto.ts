import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadStudentFileDto {
  @ApiProperty({ example: 'File name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Notes' })
  @IsString()
  @IsNotEmpty()
  notes: string;
}
