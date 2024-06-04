import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { IsDateBefore } from '../../validators/is-date-before';
import { IsDateInFuture } from '../../validators/is-date-in-future';

export class CreateClassDto {
  @ApiProperty({ example: 'Class name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Location' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: 'City' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Matnas' })
  @IsString()
  @IsNotEmpty()
  matnas: string;

  @ApiProperty({ example: 'Group Link' })
  @IsString()
  @IsNotEmpty()
  groupLink: string;

  @ApiProperty({
    example: '2023-07-23T08:00:00Z',
  })
  @IsDateString()
  @IsDateBefore('endDate', {
    message: 'startDate must be before endDate',
  })
  @IsDateInFuture({ message: 'startDate must be in the future' })
  startDate: string;

  @ApiProperty({ example: '2023-07-23T10:00:00Z' })
  @IsDateString()
  @IsDateInFuture({ message: 'endDate must be in the future' })
  endDate: string;

  @ApiProperty({ example: '4k2jk42joijgdiueiu3' })
  @IsString()
  @IsNotEmpty()
  teacherId: string;

  @ApiProperty({
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @ApiProperty({
    example: '2023-07-23T08:00:00Z',
    required: false,
  })
  @ValidateIf((o) => o.isRecurring)
  @IsDateString()
  @IsOptional()
  recurringEndDate?: string;
}
