import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { omit } from 'lodash';
import { SignInUserDto } from './dto/sign-in-user.dto';
import { UserDocument } from '../users/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(signInUserDto: SignInUserDto) {
    let user: UserDocument | null = null;
    if (signInUserDto.email) {
      user = await this.usersService.findUserByEmail(signInUserDto.email);
    }
    if (signInUserDto.phoneNumber) {
      user = await this.usersService.findUserByPhoneNumber(
        signInUserDto.phoneNumber,
      );
    }
    if (!user) throw new BadRequestException('User is not found');
    const cmp = await bcrypt.compare(signInUserDto.password, user.password);
    if (!cmp) throw new BadRequestException('Email or password is incorrect');
    const payload = omit(user.toObject(), ['password']);
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
