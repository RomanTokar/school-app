import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MongodbIdDto {
  @ApiProperty({ example: 'kdjg2k4jgdiojfie', uniqueItems: true })
  @IsString()
  @IsNotEmpty()
  _id: string;
}
