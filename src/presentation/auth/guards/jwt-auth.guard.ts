import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtCustomAuthGuard extends AuthGuard('jwt-custom') {}
