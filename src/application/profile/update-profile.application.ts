import { Injectable } from '@nestjs/common';
import {
  UpdateProfileInputDto,
  UpdateProfileResponseDto,
} from '@presentation/profile/dto/update-profile.dto';
import { UpdateProfileUseCase } from '@core/profile/update-profile.usecase';
import { UpdateProfileAdapter } from './adapters/update-profile.adapter';

@Injectable()
export class UpdateProfileApplication {
  constructor(private readonly updateProfileUseCase: UpdateProfileUseCase) {}

  async execute(
    userId: string,
    input: UpdateProfileInputDto,
  ): Promise<UpdateProfileResponseDto> {
    const result = await this.updateProfileUseCase.execute(userId, input);
    return UpdateProfileAdapter.toResponseDto(result);
  }
}
