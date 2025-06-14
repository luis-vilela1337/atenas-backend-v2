import { Injectable } from '@nestjs/common';
import {
  UpdateUserV2InputDto,
  UpdateUserV2ResponseDto,
} from '@presentation/user/dto/update-user.dto';
import { UpdateUserV2UseCase } from '@core/user/update-user.usecase';
import { UpdateUserV2Adapter } from './adapters/update';

@Injectable()
export class UpdateUserV2Application {
  constructor(private readonly users: UpdateUserV2UseCase) {}

  async execute(
    input: UpdateUserV2InputDto,
    id: string,
  ): Promise<UpdateUserV2ResponseDto> {
    try {
      const result = await this.users.execute(id, input);
      return UpdateUserV2Adapter.toResponseDto(result);
    } catch (e) {
      throw e;
    }
  }
}
