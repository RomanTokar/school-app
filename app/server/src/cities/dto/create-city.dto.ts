import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCityDto {
  @ApiProperty({ example: 'City' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
