import { Institution, User } from '@infrastructure/data/sql/entities';
import {
  CreateUserResponseV2Dto,
  CreateUserV2InputDto,
} from '@presentation/user/dto/create-user.dto';

export class CreateUserAdapter {
  static toEntity(
    dto: CreateUserV2InputDto,
    institution: Institution,
    passwordHash: string,
  ): Partial<User> {
    return {
      name: dto.name,
      identifier: dto.identifier,
      email: dto.email,
      phone: dto.phone,
      observations: dto.observations,
      passwordHash,
      role: dto.role,
      institution,
      fatherName: dto.fatherName,
      fatherPhone: dto.fatherPhone,
      motherName: dto.motherName,
      motherPhone: dto.motherPhone,
      driveLink: dto.driveLink,
      creditValue: dto.creditValue ? dto.creditValue.toString() : undefined,
      profileImage: dto.profileImage,
      zipCode: dto.address?.zipCode,
      street: dto.address?.street,
      number: dto.address?.number,
      complement: dto.address?.complement,
      neighborhood: dto.address?.neighborhood,
      city: dto.address?.city,
      state: dto.address?.state,
      cpf: dto.cpf,
      becaMeasures: dto.becaMeasures
        ? JSON.stringify(dto.becaMeasures)
        : undefined,
      status: dto.status,
    };
  }

  static toResponseDto(user: User): CreateUserResponseV2Dto {
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
      zipCode: user.zipCode || null,
      street: user.street || null,
      number: user.number || null,
      complement: user.complement || null,
      neighborhood: user.neighborhood || null,
      city: user.city || null,
      state: user.state || null,
      cpf: user.cpf || null,
      becaMeasures: user.becaMeasures
        ? this.parseBecaMeasures(user.becaMeasures)
        : null,
      createdAt: user.createdAt.toISOString(),
    };
  }

  private static parseBecaMeasures(value: string): any {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
}
