import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMatnasDto {
  @ApiProperty({ example: 'Matnas' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
