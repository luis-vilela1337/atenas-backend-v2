import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ nullable: true })
  zipCode?: string;

  @ApiProperty({ nullable: true })
  street?: string;

  @ApiProperty({ nullable: true })
  number?: string;

  @ApiProperty({ nullable: true })
  complement?: string;

  @ApiProperty({ nullable: true })
  neighborhood?: string;

  @ApiProperty({ nullable: true })
  city?: string;

  @ApiProperty({ nullable: true })
  state?: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;
}
