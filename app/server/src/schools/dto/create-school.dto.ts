import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSchoolDto {
  @ApiProperty({ example: 'School' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
