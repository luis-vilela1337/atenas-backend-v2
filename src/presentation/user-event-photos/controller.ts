import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserEventPhotosApplication } from '@application/user-event-photos/user-event-photos.application';
import { CreateUserEventPhotoDto } from './dto/create-user-event-photo.dto';
import { UserEventPhotosResponseDto } from './dto/user-event-photo-response.dto';
import { AdminGuard } from '@presentation/auth/guards/admin.guard';

@Controller('v1/users/events/photos')
@ApiTags('users/events/photos')
export class UserEventPhotosController {
  constructor(
    private readonly userEventPhotosApplication: UserEventPhotosApplication,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Adicionar fotos de usuário em evento' })
  @ApiResponse({ status: 201 })
  @UseGuards(AdminGuard)
  async create(@Body() dto: CreateUserEventPhotoDto): Promise<void> {
    return await this.userEventPhotosApplication.create(dto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Buscar fotos agrupadas por evento' })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiResponse({ status: 200, type: UserEventPhotosResponseDto })
  async findByUser(
    @Param('userId') userId: string,
  ): Promise<UserEventPhotosResponseDto> {
    return await this.userEventPhotosApplication.findByUser(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar foto de evento' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204 })
  async delete(@Param('id') id: string): Promise<void> {
    return await this.userEventPhotosApplication.delete(id);
  }
}
