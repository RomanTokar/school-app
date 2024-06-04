import { MongodbIdDto } from '../../dto/mongodb-id.dto';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { CreateTeacherNoteDto } from './create-teacher-note.dto';
import { IsDateString } from 'class-validator';

export class TeacherNoteDto extends IntersectionType(
  CreateTeacherNoteDto,
  MongodbIdDto,
) {
  @ApiProperty({
    example: '2023-07-23T08:00:00Z',
  })
  @IsDateString()
  createdAt: string;
}
