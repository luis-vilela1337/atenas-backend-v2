import { ApiProperty } from '@nestjs/swagger';
import { AddressDto } from './address.dto';
import { BecaMeasuresDto } from './beca-measures.dto';

export class UserDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ enum: ['admin', 'client'] })
  role: 'admin' | 'client';

  @ApiProperty({ format: 'uuid' })
  institutionId: string;

  @ApiProperty({ type: String })
  userContract: string;

  @ApiProperty({ enum: ['active', 'inactive'] })
  status: 'active' | 'inactive';

  @ApiProperty({ type: String })
  profileImage: string;

  @ApiProperty({ nullable: true, type: () => AddressDto })
  address?: AddressDto;

  @ApiProperty({ nullable: true })
  cpf?: string;

  @ApiProperty({ nullable: true, type: BecaMeasuresDto })
  becaMeasures?: BecaMeasuresDto;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;
}
