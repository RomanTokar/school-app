import { MongodbIdDto } from '../../dto/mongodb-id.dto';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { CreateClassNoteDto } from './create-class-note.dto';
import { IsDateString } from 'class-validator';

export class ClassNoteDto extends IntersectionType(
  CreateClassNoteDto,
  MongodbIdDto,
) {
  @ApiProperty({
    example: '2023-07-23T08:00:00Z',
  })
  @IsDateString()
  createdAt: string;
}
