import { AuthService } from '@infrastructure/services/auth.service';
import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { LogoutResponseDto } from '../dto/logout-response.dto';
import { JwtCustomAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';

@ApiTags('auth')
@Controller('v1/auth')
@ApiBearerAuth()
export class AuthControllerV2 {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiBody({ type: Object })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async login(@Request() req): Promise<AuthResponseDto> {
    const { accessToken, user } = await this.authService.login(req.user);
    return AuthResponseDto.adapterToResponse(
      accessToken,
      'testandoJAJA SAI',
      user,
    );
  }

  // @UseGuards(JwtCustomAuthGuard)
  // @Post('refresh')
  // @ApiOperation({ summary: 'Refresh do token' })
  // @ApiResponse({ status: 200, type: RefreshResponseDto })
  // async refresh(@Request() req): Promise<RefreshResponseDto> {
  //   console.log(req.user);
  //   const { token } = await this.authService.refresh(req.user);
  //   return RefreshResponseDto.adapterToResponse(token);
  // }

  @UseGuards(JwtCustomAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Logout do usuário' })
  @ApiResponse({ status: 200, type: LogoutResponseDto })
  async logout(): Promise<LogoutResponseDto> {
    return LogoutResponseDto.adapterToResponse();
  }
}
