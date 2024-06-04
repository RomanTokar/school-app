import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../auth/role.enum';

export class MeResponseDto {
  @ApiProperty()
  @IsString()
  _id: string;

  @ApiProperty({ example: '380976441051' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: 'email@mail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: Role, example: Role.Teacher })
  @IsString()
  @IsEnum(Role)
  role: string;
}
