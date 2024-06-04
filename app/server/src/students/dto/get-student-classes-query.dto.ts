import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetStudentClassesQueryDto {
  @ApiProperty({ example: 'Class 1', required: false })
  @IsString()
  @IsOptional()
  name?: string;
}
