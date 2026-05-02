import jwt from 'jsonwebtoken';
import { User } from '../users/user.model';
import { UserService } from '../users/user.service';
import { RegisterDTO, AuthResponse, JWTPayload } from './auth.interface';
import { env } from '../../config';
import { BadRequestError, UnauthorizedError, ConflictError } from '../../utils/AppError';

export class AuthService {
  constructor(private readonly userService: UserService = new UserService()) {}

  private generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  async register(data: RegisterDTO): Promise<AuthResponse> {
    const { email, password, name } = data;

    if (!email?.trim() || !password || !name?.trim()) {
      throw new BadRequestError('Name, email, and password are required');
    }

    const existing = await this.userService.findUserByEmail(email);
    if (existing) {
      throw new ConflictError('User with this email already exists');
    }

    const user = await this.userService.createUser({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.generateToken(payload);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    if (!email?.trim() || !password) {
      throw new BadRequestError('Email and password are required');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const payload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const token = this.generateToken(payload);

    return {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token');
      }
      throw new UnauthorizedError('Token verification failed');
    }
  }
}
