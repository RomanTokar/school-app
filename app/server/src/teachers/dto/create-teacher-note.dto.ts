import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeacherNoteDto {
  @ApiProperty({ example: 'Note text' })
  @IsString()
  @IsNotEmpty()
  text: string;
}
