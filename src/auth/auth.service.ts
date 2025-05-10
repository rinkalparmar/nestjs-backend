import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/user.schema';
import * as bcrypt from 'bcryptjs';
import { RefreshToken } from '../auth/schema/refresh-token.schema';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { ResetToken } from '../auth/schema/reset-token.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { refreshTokenDto } from '../auth/dto/refresh-tokens.dto';
import { changePasswordDto } from '../auth/dto/chnage-password.dto';
import { forgotPasswordDto } from '../auth/dto/forgot-password.dto';
import { nanoid } from 'nanoid';
import { ResetPasswordDto } from '../auth/dto/resert-password.dto';
import { MailService } from './service/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private authModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,
    @InjectModel(ResetToken.name) private resetTokenModel: Model<ResetToken>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signUp(signUpDto: SignupDto) {
    const {
      yourName,
      email,
      password,
      userName,
      mobile,
      dateOfBirth,
      PresentAddress,
      PermanentAddress,
      city,
      postalCode,
      country,
    } = signUpDto;

    const existing = await this.authModel.findOne({ email });
    if (existing) throw new UnauthorizedException('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.authModel.create({
      yourName,
      email,
      password: hashedPassword,
      userName,
      mobile,
      dateOfBirth,
      PresentAddress,
      PermanentAddress,
      city,
      postalCode,
      country,
    });

    return { message: 'Signup successful', userId: user._id };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const userFind = (await this.authModel.findOne({ email })) as User;
    if (!userFind) {
      throw new UnauthorizedException('Invalid Email or Password');
    }
    const IsValidePassword = await bcrypt.compare(password, userFind.password);
    if (!IsValidePassword) {
      throw new UnauthorizedException('Invalid Email or Password');
    }

    const tokens = await this.generatedUserToken(userFind._id as string);

    return {
      ...tokens,
      userId: userFind._id,
    };
  }

  async chnagePassword(userId, changePasswordDto: changePasswordDto) {
    const { oldPassword, newPassword } = changePasswordDto;
    const user = await this.authModel.findById(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const IsValidePassword = await bcrypt.compare(oldPassword, user.password);
    if (!IsValidePassword) {
      throw new UnauthorizedException('wrong credentials');
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newHashedPassword;
    await user.save();
  }

  async forgotPassword(forgotPasswordDto: forgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);
    const userFind = await this.authModel.findOne({ email });
    if (userFind) {
      const resetToken = nanoid(64);
      await this.resetTokenModel.create({
        token: resetToken,
        userId: userFind._id,
        expiryDate,
      });
      try {
        await this.mailService.sendPasswordResetEmail(email, resetToken);
      } catch (error: unknown) {
        if (error instanceof Error) {
          Logger.error('Error sending reset email:', error.message);
        } else {
          Logger.error('Error sending reset email:', error);
        }
      }
    }

    return { message: 'if user exists ,they will receive an email' };
  }

  async resetPassword(ResetPasswordDto: ResetPasswordDto) {
    const { newPassword, resetToken } = ResetPasswordDto;

    const token = await this.resetTokenModel.findOneAndDelete({
      token: resetToken,
      expiryDate: { $gte: new Date() },
    });
    if (!token) {
      throw new UnauthorizedException('invalide link');
    }

    const user = await this.authModel.findById(token.userId);
    if (!user) {
      throw new InternalServerErrorException();
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: 'Password has been reset successfully' };
  }

  async refreshTokens(refreshTokenDto: refreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    const token = await this.refreshTokenModel.findOne({
      token: refreshToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Refresh token not valide');
    }

    return this.generatedUserToken(token.userId.toString());
  }

  async generatedUserToken(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.jwtService.sign({ userId });
    const refreshToken = uuidv4();

    await this.storeRefreshToken(refreshToken, userId);

    return {
      accessToken,
      refreshToken,
    };
  }

  async storeRefreshToken(token: string, userId) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    await this.refreshTokenModel.updateOne(
      { userId },
      { $set: { expiryDate, token } },
      { upsert: true },
    );
  }
}
