import { GeneratePresignedUrV2Application } from '@application/storage/presigned-url.application';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';
import {
  GeneratePresignedUrlInputDto,
  PresignedUrlResponseDto,
} from '@presentation/user/dto/presigned-url.dto';

@Controller('user/storage')
@ApiTags('storage')
export class StorageControllerV2 {
  constructor(
    private readonly presignedUrlApplication: GeneratePresignedUrV2Application,
  ) {}

  @Post('/presigned-url')
  @ApiOperation({ summary: 'Gerar URL pré-assinada para upload' })
  @ApiBody({ type: GeneratePresignedUrlInputDto })
  @ApiResponse({ status: 201, type: PresignedUrlResponseDto })
  async generatePresignedUrl(
    @Body() dto: GeneratePresignedUrlInputDto,
  ): Promise<PresignedUrlResponseDto> {
    return await this.presignedUrlApplication.execute(dto);
  }
}
