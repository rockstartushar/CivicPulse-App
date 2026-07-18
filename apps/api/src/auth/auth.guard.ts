import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token && process.env.DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production' && request.headers['x-civicpulse-demo'] === 'true') {
      request.user = await this.auth.demoUser();
      return true;
    }
    if (!token) throw new UnauthorizedException('Bearer token required');
    request.user = await this.auth.authenticate(token);
    return true;
  }
}
