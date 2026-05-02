import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/AppError';

export const validateRequest = (req: Request, _res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => String('msg' in e ? e.msg : ''))
      .filter(Boolean)
      .join('; ');
    next(new ValidationError(message || 'Validation failed'));
    return;
  }
  next();
};
