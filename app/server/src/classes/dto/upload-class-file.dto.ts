import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const updateTypes = ['single', 'following', 'all'] as const;
type UpdateType = (typeof updateTypes)[number];

export class UploadClassFileDto {
  @ApiProperty({ example: 'File name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Notes' })
  @IsString()
  @IsNotEmpty()
  notes: string;

  @ApiProperty({ example: 'single', enum: updateTypes, required: false })
  @IsEnum(updateTypes)
  @IsOptional()
  updateType?: UpdateType;
}
