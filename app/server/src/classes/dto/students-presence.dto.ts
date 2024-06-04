import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class StudentsPresenceDto {
  @ApiProperty({ example: 70 })
  @IsNumber()
  present: number;

  @ApiProperty({ example: 30 })
  @IsNumber()
  absent: number;
}
