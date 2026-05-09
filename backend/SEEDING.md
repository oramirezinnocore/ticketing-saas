# Database Seeding Guide

## Overview

Scripts to populate the database with test data for development.

## Prerequisites

- MongoDB running locally or accessible via `MONGODB_URI`
- Backend dependencies installed (`npm install`)
- `.env` file configured with database connection

## Available Scripts

### Create Organizer User

Creates a test organizer account for event management.

#### Usage

```bash
npm run seed:organizer
```

#### Default Credentials

```
Email:    organizer@test.com
Password: Organizer123!
Role:     organizer
```

#### Script Details

**File:** `scripts/createOrganizer.ts`

**Behavior:**
- ✅ Connects to MongoDB using existing config
- ✅ Checks if organizer already exists (by email)
- ✅ Creates new user if not found
- ✅ Automatically hashes password using User model pre-save hook
- ✅ Prevents duplicates
- ✅ Displays success message with credentials
- ✅ Exits cleanly

**Output (Success - New User):**
```
🔌 Connecting to database...
✅ Organizer created successfully!

📋 Login Credentials:
   Email:    organizer@test.com
   Password: Organizer123!
   Role:     organizer

🔗 User Details:
   ID:   65a1b2c3d4e5f6789012345
   Name: Test Organizer

💡 You can now login as organizer at /login
```

**Output (Already Exists):**
```
🔌 Connecting to database...
⚠️  Organizer already exists
   Email: organizer@test.com
   Name: Test Organizer
   Role: organizer
   ID: 65a1b2c3d4e5f6789012345
```

**Output (Error):**
```
🔌 Connecting to database...
❌ Failed to create organizer: [error details]
```

#### Exit Codes

- `0` - Success (user created or already exists)
- `1` - Failure (database connection error, validation error, etc.)

## Manual MongoDB Creation (Alternative)

If you prefer to create the organizer manually:

```bash
mongosh ticketing-saas

db.users.insertOne({
  name: "Test Organizer",
  email: "organizer@test.com",
  password: "$2b$10$YourBcryptHashHere",  // You must hash the password
  role: "organizer",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Note:** Manual insertion requires pre-hashing the password with bcrypt. The seed script does this automatically.

## Customization

To create an organizer with different credentials:

1. Edit `scripts/createOrganizer.ts`
2. Modify the `ORGANIZER_DATA` constant:
   ```typescript
   const ORGANIZER_DATA = {
     name: 'Your Name',
     email: 'your-email@example.com',
     password: 'YourPassword123!',
     role: UserRole.ORGANIZER,
   };
   ```
3. Run: `npm run seed:organizer`

## Security Considerations

### Development vs Production

This script is intended for **development and testing only**.

**DO NOT** use default credentials in production:
- Change default email/password
- Use strong, unique passwords
- Store credentials securely (e.g., 1Password, LastPass)
- Enable 2FA if implemented

### Password Requirements

Default password follows these rules:
- Minimum 8 characters
- Contains uppercase letters
- Contains lowercase letters
- Contains numbers
- Contains special characters

Update password validation in `src/modules/users/user.model.ts` if needed.

## Troubleshooting

### Error: Cannot connect to MongoDB

**Cause:** MongoDB is not running or `MONGODB_URI` is incorrect

**Solution:**
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB (macOS)
brew services start mongodb-community

# Verify .env file
cat .env | grep MONGODB_URI
```

### Error: Validation failed

**Cause:** User data doesn't meet schema requirements

**Solution:**
- Check email format is valid
- Ensure password is at least 8 characters
- Verify name is at least 2 characters

### Error: Email already exists

**Cause:** User with this email already exists

**Solution:**
Either:
1. Use the existing account
2. Change email in script
3. Delete existing user:
   ```bash
   mongosh ticketing-saas
   db.users.deleteOne({ email: "organizer@test.com" })
   ```

## Testing the Account

After creating the organizer:

1. **Start Backend:**
   ```bash
   npm run dev
   ```

2. **Login via API:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "organizer@test.com",
       "password": "Organizer123!"
     }'
   ```

3. **Login via Frontend:**
   - Navigate to: http://localhost:5173/login
   - Enter credentials
   - Access organizer dashboard: http://localhost:5173/organizer

## Additional Seed Scripts

### Future Scripts (Coming Soon)

- `seed:events` - Create sample events
- `seed:users` - Create test users
- `seed:all` - Run all seed scripts
- `seed:reset` - Clear database and reseed

## Related Files

- `scripts/createOrganizer.ts` - Organizer creation script
- `src/modules/users/user.model.ts` - User model with password hashing
- `src/config/database.ts` - Database connection logic
- `src/modules/users/user.interface.ts` - User types and roles

## Support

If you encounter issues:
1. Check MongoDB is running
2. Verify `.env` configuration
3. Review error messages
4. Check backend logs
5. Refer to main `SETUP_GUIDE.md`

---

**Quick Reference:**

```bash
# Create organizer
npm run seed:organizer

# Login credentials
Email: organizer@test.com
Password: Organizer123!
```
