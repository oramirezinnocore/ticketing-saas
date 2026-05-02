# Ticketing SaaS Backend

Production-ready backend API for a Ticketing SaaS system built with Node.js, Express, TypeScript, and MongoDB.

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Security**: Helmet, CORS, Rate Limiting
- **Code Quality**: ESLint, Prettier

## Project Structure

```
backend/
├── src/
│   ├── config/           # Environment and database configuration
│   │   ├── env.ts
│   │   ├── database.ts
│   │   └── index.ts
│   ├── modules/          # Feature modules
│   │   ├── auth/         # Authentication (register, login, JWT)
│   │   ├── users/        # User management
│   │   ├── events/       # Event management
│   │   ├── tickets/      # Ticket generation and validation
│   │   ├── orders/       # Order processing
│   │   └── payments/     # Payment integration
│   ├── middlewares/      # Global middlewares
│   │   ├── errorHandler.ts
│   │   ├── notFound.ts
│   │   └── security.ts
│   ├── utils/            # Utility functions
│   │   ├── AppError.ts
│   │   ├── asyncHandler.ts
│   │   └── response.ts
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── .env.example          # Environment variables template
├── .gitignore
├── .eslintrc.json        # ESLint configuration
├── .prettierrc.json      # Prettier configuration
├── tsconfig.json         # TypeScript configuration
└── package.json
```

## Prerequisites

- Node.js v18+ and npm v9+
- MongoDB v6+ (local or cloud instance)

## Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://localhost:27017/ticketing-saas

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3000

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Start MongoDB

Make sure MongoDB is running:

```bash
# If using local MongoDB
mongosh
```

Or use a cloud MongoDB instance (MongoDB Atlas).

## Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:5000` with hot-reloading enabled.

### Production Build

```bash
npm run build
npm start
```

### Other Scripts

```bash
# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Code formatting
npm run format
npm run format:check
```

## API Endpoints

### Health Check

```
GET /health
```

Returns server status and uptime.

### Authentication (Planned)

```
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/verify
```

### Modules (Structure Ready)

- `/api/v1/users` - User management
- `/api/v1/events` - Event management
- `/api/v1/tickets` - Ticket operations
- `/api/v1/orders` - Order processing
- `/api/v1/payments` - Payment handling

## Architecture Principles

### Clean Architecture

- **Separation of Concerns**: Each module is independent
- **Scalability**: Modular structure allows easy feature additions
- **Maintainability**: Clear folder structure and naming conventions

### Security Features

- Helmet for HTTP security headers
- CORS configuration
- Rate limiting to prevent abuse
- JWT authentication (ready for implementation)
- Input validation (express-validator)
- Global error handling

### Error Handling

Custom error classes:
- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `ValidationError` (422)
- `InternalServerError` (500)

### Response Format

All responses follow a consistent format:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": { ... }
}
```

## Next Steps

1. Implement authentication logic in the auth module
2. Create Mongoose models for each entity
3. Implement business logic in controllers
4. Add validation middleware using express-validator
5. Implement JWT middleware for protected routes
6. Add unit and integration tests
7. Set up CI/CD pipeline

## Development Guidelines

- Follow TypeScript strict mode
- Use async/await for asynchronous operations
- Wrap async route handlers with `asyncHandler`
- Use custom error classes for better error handling
- Keep controllers thin, move business logic to services
- Write meaningful commit messages
- Run linter and formatter before committing

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Token expiration | 7d |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3000 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

ISC
