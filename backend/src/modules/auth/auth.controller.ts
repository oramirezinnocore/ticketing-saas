import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';

export class AuthController {
  register = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
      await Promise.resolve();
      sendSuccess(res, { message: 'Register endpoint - Implementation pending' }, 200);
    }
  );

  login = asyncHandler(async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await Promise.resolve();
    sendSuccess(res, { message: 'Login endpoint - Implementation pending' }, 200);
  });

  verifyToken = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
      await Promise.resolve();
      sendSuccess(res, { message: 'Token verification - Implementation pending' }, 200);
    }
  );
}
