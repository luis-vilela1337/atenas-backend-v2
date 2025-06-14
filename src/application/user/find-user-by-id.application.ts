import { Injectable } from '@nestjs/common';
import { FindUserByIDV2UseCase } from '@core/user/find-by-id.usecase';
import {
  UserAdapterEntity,
  UserPayloadDto,
} from './adapters/mapper.find-by-id';

@Injectable()
export class FindUserByIdV2Application {
  constructor(private readonly users: FindUserByIDV2UseCase) {}

  async execute(id: string): Promise<UserPayloadDto> {
    try {
      const result = await this.users.execute(id);
      return UserAdapterEntity.toPayload(result);
    } catch (e) {
      throw e;
    }
  }
}
