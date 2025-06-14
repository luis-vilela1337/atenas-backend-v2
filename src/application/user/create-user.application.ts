import { Injectable } from '@nestjs/common';
import { CreateUserV2UseCase } from '@core/user/create-user.usecase';
import {
  CreateUserV2InputDto,
  CreateUserResponseV2Dto,
} from '@presentation/user/dto/create-user.dto';
import { CreateUserAdapter } from './adapters/create';

@Injectable()
export class CreateUserV2Application {
  constructor(private readonly users: CreateUserV2UseCase) {}

  async execute(input: CreateUserV2InputDto): Promise<CreateUserResponseV2Dto> {
    try {
      const result = await this.users.execute(input);
      return CreateUserAdapter.toResponseDto(result);
    } catch (e) {
      throw e;
    }
  }
}
