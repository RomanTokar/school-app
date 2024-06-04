import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetStudentsQueryDto {
  @ApiProperty({ example: 'Roman', required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ example: 'City', required: false })
  @IsString()
  @IsOptional()
  city: string;

  @ApiProperty({ example: 'School', required: false })
  @IsString()
  @IsOptional()
  school: string;

  @ApiProperty({ example: 'Matnas', required: false })
  @IsString()
  @IsOptional()
  matnas: string;
}
