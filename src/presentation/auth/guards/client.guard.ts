import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtCustomAuthGuard } from './jwt-auth.guard';

@Injectable()
export class ClientGuard extends JwtCustomAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authenticated = await super.canActivate(context);
    if (!authenticated) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user.role !== 'client') {
      throw new ForbiddenException('Client access required');
    }

    return true;
  }
}