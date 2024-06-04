import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserPasswordDto {
  @ApiProperty({
    example: 'old_very_difficult_password',
  })
  @IsString()
  oldPassword: string;

  @ApiProperty({
    example: 'new_very_difficult_password',
  })
  @IsString()
  newPassword: string;
}
