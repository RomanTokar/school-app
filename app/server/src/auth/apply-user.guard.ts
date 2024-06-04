import { Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class ApplyUser extends JwtAuthGuard {
  handleRequest(err: any, user: any) {
    if (user) return user;
    return null;
  }
}
