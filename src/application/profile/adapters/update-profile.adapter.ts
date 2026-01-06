import { User } from '@infrastructure/data/sql/entities';
import { UpdateProfileResponseDto } from '@presentation/profile/dto/update-profile.dto';

export class UpdateProfileAdapter {
  static toResponseDto(user: User): UpdateProfileResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage || null,
      address: {
        zipCode: user.zipCode || null,
        street: user.street || null,
        number: user.number || null,
        complement: user.complement || null,
        neighborhood: user.neighborhood || null,
        city: user.city || null,
        state: user.state || null,
      },
      updatedAt: user.updatedAt
        ? user.updatedAt.toISOString()
        : new Date().toISOString(),
    };
  }
}
