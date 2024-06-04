import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { IsDateBefore } from '../../validators/is-date-before';

export class GetStudentPresenceQueryDto {
  @ApiProperty({
    example: '2023-07-23T08:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsDateBefore('endDate', {
    message: 'startDate must be before endDate',
  })
  @IsOptional()
  startDate?: string;

  @ApiProperty({ example: '2023-07-23T10:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
