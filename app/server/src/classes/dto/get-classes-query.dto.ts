import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { IsDateBefore } from '../../validators/is-date-before';

export class GetClassesQueryDto {
  @ApiProperty({ example: 'Class', required: false })
  @IsString()
  @IsOptional()
  name?: string;

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

  @ApiProperty({ example: '4k2jk42joijgdiueiu3', required: false })
  @IsString()
  @IsOptional()
  teacherId?: string;
}
