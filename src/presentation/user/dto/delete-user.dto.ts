import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserResponseDto {
  @ApiProperty() success: boolean;
  @ApiProperty() message: string;
}
