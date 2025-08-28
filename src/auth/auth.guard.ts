import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  // handleRequest<TUser>(error: any, user: TUser): TUser {
  //   if (error instanceof Error) {
  //     throw new UnauthorizedException();
  //   }
  //   return user;
  // }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
