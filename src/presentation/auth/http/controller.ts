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
import { JwtCustomAuthGuard } from '../guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { RefreshTokenApplication } from '@application/auth/refresh-token.application';
import { LogoutApplication } from '@application/auth/logout.application';
import { AuthService } from '@infrastructure/services/auth.service';

@ApiTags('auth')
@Controller('v1/auth')
@ApiBearerAuth()
export class AuthControllerV2 {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokenApp: RefreshTokenApplication,
    private readonly logoutApp: LogoutApplication,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiBody({ type: Object })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async login(@Request() req): Promise<AuthResponseDto> {
    const { accessToken, refreshToken, user } = await this.authService.login(req.user);
    return AuthResponseDto.adapterToResponse(accessToken, refreshToken, user);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, type: RefreshResponseDto })
  async refresh(@Request() req): Promise<RefreshResponseDto> {
    const { token } = await this.refreshTokenApp.execute({
      userId: req.user.userId,
      refreshToken: req.user.refreshToken,
    });
    return RefreshResponseDto.adapterToResponse(token);
  }

  @UseGuards(JwtCustomAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Logout do usuário' })
  @ApiResponse({ status: 200, type: LogoutResponseDto })
  async logout(@Request() req): Promise<LogoutResponseDto> {
    await this.logoutApp.execute({ userId: req.user.userId });
    return LogoutResponseDto.adapterToResponse();
  }
}