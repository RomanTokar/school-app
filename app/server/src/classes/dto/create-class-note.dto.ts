import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const updateTypes = ['single', 'following', 'all'] as const;
type UpdateType = (typeof updateTypes)[number];

export class CreateClassNoteDto {
  @ApiProperty({ example: 'Note text' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ example: 'single', enum: updateTypes, required: false })
  @IsEnum(updateTypes)
  @IsOptional()
  updateType?: UpdateType;
}
