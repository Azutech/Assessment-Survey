import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    try {
      if (!authHeader) {
        throw new UnauthorizedException('Authorization header missing');
      }

      if (!authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Invalid authorization header format');
      }

      const accessToken = authHeader.split(' ')[1];
      const decoded = this.jwtService.verifyAndDecryptToken(accessToken);
      request.user = decoded;

      return true;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }

      throw new UnauthorizedException('Invalid token');
    }
  }
}
