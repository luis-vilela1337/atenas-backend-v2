import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtCustomAuthGuard } from '@presentation/auth/guards/jwt-auth.guard';
import { UpdateProfileApplication } from '@application/profile/update-profile.application';
import {
  UpdateProfileInputDto,
  UpdateProfileResponseDto,
} from './dto/update-profile.dto';

@Controller('v1/profile')
@ApiTags('profile')
export class ProfileController {
  constructor(
    private readonly updateProfileApplication: UpdateProfileApplication,
  ) {}

  @Patch()
  @ApiOperation({ summary: 'Atualizar perfil do usuário logado' })
  @ApiBearerAuth()
  @ApiBody({ type: UpdateProfileInputDto })
  @ApiResponse({ status: 200, type: UpdateProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 409, description: 'Email já está em uso' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtCustomAuthGuard)
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileInputDto,
  ): Promise<UpdateProfileResponseDto> {
    return await this.updateProfileApplication.execute(
      req.user.userId,
      updateProfileDto,
    );
  }
}
