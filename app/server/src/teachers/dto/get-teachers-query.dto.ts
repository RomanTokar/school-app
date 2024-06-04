import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetTeachersQueryDto {
  @ApiProperty({ example: 'Roman', required: false })
  @IsString()
  @IsOptional()
  fullName?: string;
}
