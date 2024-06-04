import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'City' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'School' })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => !o.matnas)
  school: string;

  @ApiProperty({ example: 'Matnas' })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => !o.school)
  matnas: string;

  @ApiProperty({ example: 'School' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  ID: string;

  @ApiProperty({ example: '380976441051' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: 'email@mail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'WhatsApp Link' })
  @IsString()
  @IsNotEmpty()
  WhatsAppLink: string;
}
