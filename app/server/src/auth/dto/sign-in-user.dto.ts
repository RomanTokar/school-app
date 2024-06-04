import { IsEmail, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInUserDto {
  @ApiProperty({ required: false, example: 'email@mail.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false, example: '380976441051' })
  @IsString()
  @IsOptional()
  @ValidateIf((person: SignInUserDto) => Boolean(person.email))
  phoneNumber?: string;

  @ApiProperty({
    example: 'very_difficult_password',
  })
  @IsString()
  password: string;
}
