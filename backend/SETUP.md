# Quick Setup Guide

## Installation Steps

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Edit .env with your configuration
# Required: MONGODB_URI, JWT_SECRET

# 5. Start development server
npm run dev
```

## Test the Setup

```bash
# Health check endpoint
curl http://localhost:5000/health

# Expected response:
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-...",
    "uptime": 1.234
  }
}
```

## Available Endpoints

### Current
- `GET /health` - Health check

### Auth Module (Ready)
- `POST /api/v1/auth/register` - User registration (placeholder)
- `POST /api/v1/auth/login` - User login (placeholder)
- `GET /api/v1/auth/verify` - Token verification (placeholder)

## Module Structure

Each module follows this pattern:

```
module/
├── {module}.interface.ts  # TypeScript interfaces
├── {module}.controller.ts # Request handlers
├── {module}.routes.ts     # Route definitions
└── index.ts               # Module exports
```

## Next Implementation Tasks

1. **Auth Module**: Implement full JWT authentication
2. **User Model**: Create Mongoose schema for users
3. **Validation**: Add express-validator middleware
4. **Auth Middleware**: Protect routes with JWT verification
5. **Other Modules**: Implement events, tickets, orders, payments

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Test connection: `mongosh`

### Port Already in Use
- Change PORT in .env
- Or kill process: `lsof -ti:5000 | xargs kill -9`

### TypeScript Errors
- Run type check: `npm run type-check`
- Check tsconfig.json paths

## Code Quality

```bash
# Before committing
npm run lint:fix
npm run format
npm run type-check
```
