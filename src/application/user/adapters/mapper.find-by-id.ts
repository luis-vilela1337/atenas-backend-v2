import { User } from '@infrastructure/data/sql/entities';
import { ApiProperty } from '@nestjs/swagger';
import { AddressDto } from '@presentation/user/dto/address.dto';

export class UserPayloadDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  identifier: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ nullable: true })
  observations: string | null;

  @ApiProperty()
  role: string;

  @ApiProperty({ format: 'uuid' })
  institutionId: string;

  @ApiProperty({ nullable: true })
  fatherName: string | null;

  @ApiProperty({ nullable: true })
  fatherPhone: string | null;

  @ApiProperty({ nullable: true })
  motherName: string | null;

  @ApiProperty({ nullable: true })
  motherPhone: string | null;

  @ApiProperty({ nullable: true })
  driveLink: string | null;

  @ApiProperty({ nullable: true })
  creditValue: number | null;

  @ApiProperty({ nullable: true })
  profileImage: string | null;

  @ApiProperty()
  status: string;

  @ApiProperty({ nullable: true, type: () => AddressDto })
  address?: AddressDto;

  @ApiProperty({ nullable: true })
  cpf: string | null;

  @ApiProperty({ nullable: true })
  becaMeasures: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: string;
}

export class UserAdapterEntity {
  static toPayload(user: User): UserPayloadDto {
    return {
      id: user.id,
      name: user.name,
      identifier: user.identifier,
      email: user.email,
      phone: user.phone,
      observations: user.observations || null,
      role: user.role,
      institutionId: user.institution.id,
      fatherName: user.fatherName || null,
      fatherPhone: user.fatherPhone || null,
      motherName: user.motherName || null,
      motherPhone: user.motherPhone || null,
      driveLink: user.driveLink || null,
      creditValue: user.creditValue ? parseFloat(user.creditValue) : null,
      profileImage: user.profileImage || null,
      status: user.status,
      address:
        user.zipCode ||
        user.street ||
        user.number ||
        user.complement ||
        user.neighborhood ||
        user.city ||
        user.state
          ? {
              zipCode: user.zipCode,
              street: user.street,
              number: user.number,
              complement: user.complement,
              neighborhood: user.neighborhood,
              city: user.city,
              state: user.state,
            }
          : undefined,
      cpf: user.cpf || null,
      becaMeasures: user.becaMeasures || null,
      createdAt: user.createdAt.toISOString(),
    };
  }

  static toPayloadArray(users: User[]): UserPayloadDto[] {
    return users.map((user) => this.toPayload(user));
  }
}
