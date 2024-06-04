import { BadRequestException, Injectable } from '@nestjs/common';
import { User, UserDocument } from './user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    return this.userModel.create(createUserDto);
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  async findUserByPhoneNumber(
    phoneNumber: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({ phoneNumber });
  }

  async findUserById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async update(
    userId: string,
    updateProductDto: UpdateUserDto,
  ): Promise<any> {
    return this.userModel
      .findOneAndUpdate({ _id: userId }, updateProductDto, { new: true })
      .select('-password');
  }

  async updatePassword(
    userId: string,
    updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    const { oldPassword, newPassword } = updateUserPasswordDto;
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');
    const cmp = await bcrypt.compare(oldPassword, user.password);
    if (!cmp) throw new BadRequestException('Old password is incorrect');
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
  }

  remove(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }
}
