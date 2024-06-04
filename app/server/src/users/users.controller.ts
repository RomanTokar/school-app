import {
  Body,
  Controller,
  ForbiddenException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { CurrentUser } from '../param-decorators/current-user';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Put(':id/password')
  changeUserPassword(
    @Param('id') userId: string,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
    @CurrentUser() user,
  ) {
    if (user._id === userId) {
      return this.usersService.updatePassword(userId, updateUserPasswordDto);
    } else {
      throw new ForbiddenException('You are not allowed to update this user');
    }
  }
}
