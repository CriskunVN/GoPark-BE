import type { IUser } from '../models/user.model';

declare module './routes/*.js' {
  import { Router } from 'express';
  const router: Router;
  export default router;
}
declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
  }
}
