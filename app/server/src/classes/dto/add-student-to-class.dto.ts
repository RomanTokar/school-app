import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const updateTypes = ['single', 'following', 'all'] as const;
type UpdateType = (typeof updateTypes)[number];

export class AddStudentToClassDto {
  @ApiProperty({ example: 'single', enum: updateTypes, required: false })
  @IsEnum(updateTypes)
  @IsOptional()
  updateType?: UpdateType;
}
