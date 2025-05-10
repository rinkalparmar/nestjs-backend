import {
  Controller,
  Post,
  UsePipes,
  Body,
  UseGuards,
  Put,
  Req,
} from '@nestjs/common';
import { YupValidationPipe } from '../yup/yup-validation.pipe';
import { AuthService } from './auth.service';
import { signupSchema } from './dto/signup.dto';
import { SignupDto } from './dto/signup.dto';
import { LoginDto, loginSchema } from './dto/login.dto';
import { refreshTokenSchema, refreshTokenDto } from './dto/refresh-tokens.dto';

import { changePasswordDto } from './dto/chnage-password.dto';
import { AuthenticationGuard } from './guards/authentication.guard';
import { forgotPasswordDto } from './dto/forgot-password.dto';
import {
  ResetPasswordDto,
  resetPasswordSchema,
} from './dto/resert-password.dto';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @UsePipes(new YupValidationPipe(signupSchema))
  async signUp(@Body() signUpDto: SignupDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('login')
  @UsePipes(new YupValidationPipe(loginSchema))
  async login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }

  @Post('/refresh')
  @UsePipes(new YupValidationPipe(refreshTokenSchema))
  async refreshTokens(@Body() refreshTokenDto: refreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @UseGuards(AuthenticationGuard) //checked userid and verify token also
  @Put('/change-password')
  async changePassword(
    @Body() changePasswordDto: changePasswordDto,
    @Req() req: { userId: string },
  ) {
    const { userId } = req;
    return this.authService.chnagePassword(userId, changePasswordDto);
  }

  @Post('/forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: forgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('/reset-password')
  @UsePipes(new YupValidationPipe(resetPasswordSchema))
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
