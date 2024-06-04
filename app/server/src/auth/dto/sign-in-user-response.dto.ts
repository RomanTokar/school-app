import { ApiProperty } from '@nestjs/swagger';

export class SignInUserResponseDto {
  @ApiProperty()
  accessToken: string;
}
