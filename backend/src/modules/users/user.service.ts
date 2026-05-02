import { Types } from 'mongoose';
import { User } from './user.model';
import { IUser, IUserDocument, UserRole } from './user.interface';
import { BadRequestError, ConflictError, ValidationError } from '../../utils/AppError';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export class UserService {
  private toPublicUser(doc: IUserDocument): IUser {
    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      role: doc.role,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async createUser(data: CreateUserData): Promise<IUser> {
    const { name, email, password, role } = data;

    if (!name?.trim() || !email?.trim() || !password) {
      throw new BadRequestError('Name, email, and password are required');
    }

    try {
      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        ...(role !== undefined ? { role } : {}),
      });

      return this.toPublicUser(user);
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: number }).code === 11000
      ) {
        throw new ConflictError('User with this email already exists');
      }

      if (error instanceof Error && error.name === 'ValidationError') {
        throw new ValidationError(error.message);
      }

      throw error;
    }
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    if (!email?.trim()) {
      throw new BadRequestError('Email is required');
    }

    const normalized = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalized }).select('-password');

    if (!user) {
      return null;
    }

    return this.toPublicUser(user);
  }

  async findUserById(id: string): Promise<IUser | null> {
    if (!id?.trim()) {
      throw new BadRequestError('User id is required');
    }

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid user id format');
    }

    const user = await User.findById(id).select('-password');

    if (!user) {
      return null;
    }

    return this.toPublicUser(user);
  }
}
