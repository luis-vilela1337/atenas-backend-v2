import { Controller, Post, Request, UseGuards, Body } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { LogoutResponseDto } from '../dto/logout-response.dto';
import { RefreshResponseDto } from '../dto/refresh-response.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ForgotPasswordRequestDto } from '../dto/forgot-password-request.dto';
import { ForgotPasswordResponseDto } from '../dto/forgot-password-response.dto';
import { ResetPasswordRequestDto } from '../dto/reset-password-request.dto';
import { ResetPasswordResponseDto } from '../dto/reset-password-response.dto';
import { JwtCustomAuthGuard } from '../guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { RefreshTokenApplication } from '@application/auth/refresh-token.application';
import { LogoutApplication } from '@application/auth/logout.application';
import { RequestPasswordResetApplication } from '@application/auth/request-password-reset.application';
import { ResetPasswordApplication } from '@application/auth/reset-password.application';
import { AuthService } from '@infrastructure/services/auth.service';

@ApiTags('auth')
@Controller('v1/auth')
@ApiBearerAuth()
export class AuthControllerV2 {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokenApp: RefreshTokenApplication,
    private readonly logoutApp: LogoutApplication,
    private readonly requestPasswordResetApp: RequestPasswordResetApplication,
    private readonly resetPasswordApp: ResetPasswordApplication,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiBody({ type: Object })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async login(@Request() req): Promise<AuthResponseDto> {
    const { accessToken, refreshToken, user } = await this.authService.login(
      req.user,
    );
    return AuthResponseDto.adapterToResponse(accessToken, refreshToken, user);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, type: RefreshResponseDto })
  async refresh(@Request() req): Promise<RefreshResponseDto> {
    const { token, user } = await this.refreshTokenApp.execute({
      userId: req.user.userId,
      refreshToken: req.user.refreshToken,
    });
    return RefreshResponseDto.adapterToResponse(token, user);
  }

  @UseGuards(JwtCustomAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Logout do usuário' })
  @ApiResponse({ status: 200, type: LogoutResponseDto })
  async logout(@Request() req): Promise<LogoutResponseDto> {
    await this.logoutApp.execute({ userId: req.user.userId });
    return LogoutResponseDto.adapterToResponse();
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar redefinição de senha' })
  @ApiBody({ type: ForgotPasswordRequestDto })
  @ApiResponse({ status: 200, type: ForgotPasswordResponseDto })
  async forgotPassword(
    @Body() body: ForgotPasswordRequestDto,
  ): Promise<ForgotPasswordResponseDto> {
    const result = await this.requestPasswordResetApp.execute({
      email: body.email,
    });
    return ForgotPasswordResponseDto.adapterToResponse(result.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Redefinir senha com código de verificação' })
  @ApiBody({ type: ResetPasswordRequestDto })
  @ApiResponse({ status: 200, type: ResetPasswordResponseDto })
  async resetPassword(
    @Body() body: ResetPasswordRequestDto,
  ): Promise<ResetPasswordResponseDto> {
    await this.resetPasswordApp.execute({
      email: body.email,
      code: body.code,
      newPassword: body.newPassword,
    });
    return ResetPasswordResponseDto.adapterToResponse();
  }
}
