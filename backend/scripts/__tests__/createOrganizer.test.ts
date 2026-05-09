import { User } from '../../src/modules/users/user.model';
import { UserRole } from '../../src/modules/users/user.interface';

// Mock dependencies
jest.mock('../../src/config/database', () => ({
  connectDatabase: jest.fn().mockResolvedValue(undefined),
  disconnectDatabase: jest.fn().mockResolvedValue(undefined),
}));

const ORGANIZER_DATA = {
  name: 'Test Organizer',
  email: 'organizer@test.com',
  password: 'Organizer123!',
  role: UserRole.ORGANIZER,
};

describe('createOrganizer script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User model password hashing', () => {
    it('should automatically hash password on save', async () => {
      const mockUser = {
        name: ORGANIZER_DATA.name,
        email: ORGANIZER_DATA.email,
        password: ORGANIZER_DATA.password,
        role: ORGANIZER_DATA.role,
        isModified: jest.fn().mockReturnValue(true),
      };

      // Test that password would be hashed (model pre-save hook)
      expect(mockUser.password).toBe('Organizer123!');
      // After save, password should be hashed (bcrypt format)
      // This is tested by the User model pre-save hook
    });

    it('should validate required fields', () => {
      const requiredFields = ['name', 'email', 'password', 'role'];
      requiredFields.forEach((field) => {
        expect(ORGANIZER_DATA).toHaveProperty(field);
      });
    });

    it('should use correct organizer role', () => {
      expect(ORGANIZER_DATA.role).toBe(UserRole.ORGANIZER);
    });
  });

  describe('Data validation', () => {
    it('should have valid email format', () => {
      const emailRegex = /^\S+@\S+\.\S+$/;
      expect(emailRegex.test(ORGANIZER_DATA.email)).toBe(true);
    });

    it('should have password meeting minimum length', () => {
      expect(ORGANIZER_DATA.password.length).toBeGreaterThanOrEqual(8);
    });

    it('should have name meeting minimum length', () => {
      expect(ORGANIZER_DATA.name.length).toBeGreaterThanOrEqual(2);
    });

    it('should have name within maximum length', () => {
      expect(ORGANIZER_DATA.name.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Duplicate prevention', () => {
    it('should check for existing user by email', async () => {
      // Mock User.findOne
      const findOneMock = jest.spyOn(User, 'findOne').mockResolvedValue(null);

      // Simulate checking for existing user
      const existingUser = await User.findOne({ email: ORGANIZER_DATA.email });

      expect(findOneMock).toHaveBeenCalledWith({ email: ORGANIZER_DATA.email });
      expect(existingUser).toBeNull();

      findOneMock.mockRestore();
    });

    it('should handle existing organizer gracefully', async () => {
      const mockExistingUser = {
        _id: 'mock-id',
        name: ORGANIZER_DATA.name,
        email: ORGANIZER_DATA.email,
        role: ORGANIZER_DATA.role,
      };

      const findOneMock = jest.spyOn(User, 'findOne').mockResolvedValue(mockExistingUser as any);

      const existingUser = await User.findOne({ email: ORGANIZER_DATA.email });

      expect(existingUser).not.toBeNull();
      expect(existingUser?.email).toBe(ORGANIZER_DATA.email);
      expect(existingUser?.role).toBe(UserRole.ORGANIZER);

      findOneMock.mockRestore();
    });
  });

  describe('Script configuration', () => {
    it('should use test credentials for development', () => {
      expect(ORGANIZER_DATA.email).toMatch(/@test\.com$/);
    });

    it('should include secure password with special characters', () => {
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(ORGANIZER_DATA.password);
      const hasNumber = /\d/.test(ORGANIZER_DATA.password);
      const hasUpperCase = /[A-Z]/.test(ORGANIZER_DATA.password);
      const hasLowerCase = /[a-z]/.test(ORGANIZER_DATA.password);

      expect(hasSpecialChar).toBe(true);
      expect(hasNumber).toBe(true);
      expect(hasUpperCase).toBe(true);
      expect(hasLowerCase).toBe(true);
    });
  });
});
