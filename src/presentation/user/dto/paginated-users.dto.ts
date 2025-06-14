import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';
import { PaginationMetaDto } from '@presentation/user/dto/pagination-meta.dto';

export class PaginatedUsersDto {
  @ApiProperty({ type: [UserDto] })
  data: UserDto[];

  @ApiProperty({ type: () => PaginationMetaDto })
  pagination: PaginationMetaDto;
}
