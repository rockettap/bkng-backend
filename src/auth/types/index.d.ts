import type { JwtPayload } from './jwt-payload.type';

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload;
  }
}
