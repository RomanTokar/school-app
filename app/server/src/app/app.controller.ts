import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SignInUserDto } from '../auth/dto/sign-in-user.dto';
import { SignInUserResponseDto } from '../auth/dto/sign-in-user-response.dto';
import { pick } from 'lodash';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { MeResponseDto } from './dto/me-response.dto';
import { CurrentUser } from '../param-decorators/current-user';
import { Role } from '../auth/role.enum';
import { TeachersService } from '../teachers/teachers.service';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller()
export class AppController {
  constructor(
    private authService: AuthService,
    private teachersService: TeachersService,
  ) {}

  @ApiCreatedResponse({
    description: 'Successfully signed in',
    type: SignInUserResponseDto,
  })
  @Post('/auth/sign-in')
  async signIn(@Body() signInUserDto: SignInUserDto) {
    return this.authService.signIn(signInUserDto);
  }

  @ApiCreatedResponse({
    type: MeResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getMe(@CurrentUser() user) {
    const me: {
      email: string;
      role: Role;
      phoneNumber: string;
      _id: string;
      teacherId?: string;
    } = pick(user, ['email', 'role', 'phoneNumber', '_id']);

    if (user.role === Role.Teacher) {
      const teacher = await this.teachersService.findOneByUserId(user._id);
      me.teacherId = teacher._id.toString();
    }
    return me;
  }
}
