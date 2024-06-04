import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const deleteTypes = ['single', 'following', 'all'] as const;
type DeleteType = (typeof deleteTypes)[number];

export class DeleteClassFileDto {
  @ApiProperty({ example: 'single', enum: deleteTypes, required: false })
  @IsEnum(deleteTypes)
  @IsOptional()
  deleteType?: DeleteType;
}
