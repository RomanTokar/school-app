import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CreateClassDto } from './create-class.dto';
import { IsDateString, IsEnum, IsOptional, ValidateIf } from 'class-validator';
import { IsDateBefore } from '../../validators/is-date-before';
import { IsDateInFuture } from '../../validators/is-date-in-future';

const updateTypes = ['single', 'following', 'all'] as const;
type UpdateType = (typeof updateTypes)[number];

export class UpdateClassDto extends PartialType(
  OmitType(CreateClassDto, ['isRecurring', 'recurringEndDate']),
) {
  @ApiProperty({ example: 'single', enum: updateTypes, required: false })
  @IsEnum(updateTypes)
  @IsOptional()
  updateType?: UpdateType;

  @ApiProperty({
    example: '2023-07-23T08:00:00Z',
  })
  @IsDateString()
  @IsDateBefore('endDate', {
    message: 'startDate must be before endDate',
  })
  @IsDateInFuture({ message: 'startDate must be in the future' })
  @ValidateIf((o) => o.endDate)
  startDate: string;

  @ApiProperty({ example: '2023-07-23T10:00:00Z' })
  @IsDateString()
  @IsDateInFuture({ message: 'endDate must be in the future' })
  @ValidateIf((o) => o.startDate)
  endDate: string;
}
