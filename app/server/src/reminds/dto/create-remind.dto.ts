import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { IsDateInFuture } from '../../validators/is-date-in-future';

export class CreateRemindDto {
  @ApiProperty({ example: 'Remind text' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({
    example: '2023-07-23T08:00:00Z',
  })
  @IsDateString()
  @IsDateInFuture({ message: 'date must be in the future' })
  date: string;
}
