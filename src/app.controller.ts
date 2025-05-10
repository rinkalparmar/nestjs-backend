import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from './auth/guards/authentication.guard';
import { RequestWithUserId } from './auth/interface/request-with-user';

@UseGuards(AuthenticationGuard)
@Controller()
export class AppController {
  @Get()
  someprotectedRoute(@Req() request: RequestWithUserId) {
    return {
      message: 'Authenticated request',
      userId: request.userId,
    };
  }
}
