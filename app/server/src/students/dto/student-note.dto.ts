import { MongodbIdDto } from '../../dto/mongodb-id.dto';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { CreateStudentNoteDto } from './create-student-note.dto';
import { IsDateString } from 'class-validator';

export class StudentNoteDto extends IntersectionType(
  CreateStudentNoteDto,
  MongodbIdDto,
) {
  @ApiProperty({
    example: '2023-07-23T08:00:00Z',
  })
  @IsDateString()
  createdAt: string;
}
