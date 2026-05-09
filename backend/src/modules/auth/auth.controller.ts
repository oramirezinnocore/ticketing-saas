import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDTO, LoginDTO } from './auth.interface';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { BadRequestError } from '../../utils/AppError';

export class AuthController {
  constructor(private readonly authService: AuthService = new AuthService()) {}

  /**
   * @desc    Register new user
   * @route   POST /api/v1/auth/register
   * @access  Public
   */
  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = req.body as RegisterDTO;

    // Validate required fields
    if (!name || !email || !password) {
      throw new BadRequestError('Name, email, and password are required');
    }

    // Call AuthService to register user
    const result = await this.authService.register({ name, email, password });

    // Return response with token and user
    sendSuccess(res, result, 201);
  });

  /**
   * @desc    Login user
   * @route   POST /api/v1/auth/login
   * @access  Public
   */
  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as LoginDTO;

    // Validate required fields
    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }

    // Call AuthService to login user
    const result = await this.authService.login(email, password);

    // Return response with token and user
    sendSuccess(res, result, 200);
  });

  /**
   * @desc    Verify JWT token and get current user
   * @route   GET /api/v1/auth/verify
   * @access  Private (requires authentication)
   */
  verifyToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // User is already attached to req by authenticate middleware
    if (!req.user) {
      throw new BadRequestError('User not found in request');
    }

    // Return authenticated user info
    sendSuccess(
      res,
      {
        valid: true,
        user: {
          id: req.user.userId,
          email: req.user.email,
          role: req.user.role,
        },
      },
      200
    );
  });
}
