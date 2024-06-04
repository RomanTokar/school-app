import { CreateClassDto } from './create-class.dto';
import { ApiProperty, IntersectionType, OmitType } from '@nestjs/swagger';
import { MongodbIdDto } from '../../dto/mongodb-id.dto';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { TeacherDto } from '../../teachers/dto/teacher.dto';

export class ClassDto extends OmitType(
  IntersectionType(CreateClassDto, MongodbIdDto),
  ['teacherId'],
) {
  @ApiProperty({
    example: { _id: 'gjdiwoeujg498390gdkj', fullName: 'Roman Tokar' },
  })
  teacher: Pick<TeacherDto, '_id' | 'fullName'>;

  @ApiProperty({ example: 3 })
  @IsInt()
  studentsCount: number;

  @ApiProperty({ example: 'weekly' })
  @IsString()
  @IsOptional()
  recurringType?: 'weekly';

  @ApiProperty({ example: 'igkdjgkjgkdjrioufj482gdi' })
  @IsString()
  classId: string;
}
