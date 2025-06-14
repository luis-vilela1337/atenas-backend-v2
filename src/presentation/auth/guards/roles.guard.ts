import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@infrastructure/data/sql/entities/user.entity';
import { Role, ROLES_KEY } from '../roles/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<Role[]>(
      ROLES_KEY,
      context.getHandler(),
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userJwt = request.user;
    if (!userJwt || !userJwt.userId) {
      throw new ForbiddenException('No user in request');
    }

    const user = await this.usersRepo.findOne({
      where: { id: userJwt.userId },
    });
    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (!requiredRoles.includes(user.role as Role)) {
      throw new ForbiddenException(
        `Required role: [${requiredRoles.join(', ')}], but you have: ${
          user.role
        }`,
      );
    }

    request.user = user;
    return true;
  }
}
