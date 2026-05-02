# Backend Project Structure

## Complete File Tree

```
backend/
├── src/
│   ├── config/
│   │   ├── env.ts              # Environment variables configuration
│   │   ├── database.ts         # MongoDB connection setup
│   │   └── index.ts            # Config exports
│   │
│   ├── middlewares/
│   │   ├── errorHandler.ts     # Global error handling middleware
│   │   ├── notFound.ts         # 404 handler
│   │   ├── security.ts         # Security middlewares (CORS, Helmet, Rate Limiting)
│   │   └── index.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.interface.ts    # Auth DTOs and types
│   │   │   ├── auth.controller.ts   # Auth request handlers
│   │   │   ├── auth.routes.ts       # Auth route definitions
│   │   │   └── index.ts
│   │   │
│   │   ├── users/
│   │   │   ├── user.interface.ts    # User types and roles
│   │   │   ├── user.routes.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── events/
│   │   │   ├── event.interface.ts   # Event types
│   │   │   ├── event.routes.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── tickets/
│   │   │   ├── ticket.interface.ts  # Ticket types
│   │   │   ├── ticket.routes.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── orders/
│   │   │   ├── order.interface.ts   # Order types and status
│   │   │   ├── order.routes.ts
│   │   │   └── index.ts
│   │   │
│   │   └── payments/
│   │       ├── payment.interface.ts # Payment types and status
│   │       ├── payment.routes.ts
│   │       └── index.ts
│   │
│   ├── utils/
│   │   ├── AppError.ts         # Custom error classes
│   │   ├── asyncHandler.ts     # Async route wrapper
│   │   ├── response.ts         # Standard response helpers
│   │   └── index.ts
│   │
│   ├── app.ts                  # Express app configuration
│   └── server.ts               # Server entry point
│
├── .env.example                # Environment template
├── .gitignore
├── .eslintrc.json              # ESLint configuration
├── .prettierrc.json            # Prettier configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
├── README.md                   # Full documentation
├── SETUP.md                    # Quick setup guide
└── PROJECT_STRUCTURE.md        # This file
```

## File Responsibilities

### Configuration Layer (`config/`)

**env.ts**
- Loads and validates environment variables
- Provides typed access to configuration
- Throws errors for missing required vars

**database.ts**
- MongoDB connection management
- Connection pooling configuration
- Graceful disconnect handling
- Error and reconnection event listeners

### Middleware Layer (`middlewares/`)

**errorHandler.ts**
- Catches all errors from routes
- Formats error responses consistently
- Handles MongoDB, JWT, and validation errors
- Hides stack traces in production

**notFound.ts**
- Handles 404 for undefined routes

**security.ts**
- CORS middleware for cross-origin requests
- Helmet for HTTP security headers
- Rate limiting to prevent abuse

### Module Layer (`modules/`)

Each module represents a domain feature:

**auth/**
- User registration and login
- JWT token generation and verification
- Authentication logic

**users/**
- User profile management
- Role-based access (user, organizer, admin)

**events/**
- Event creation and management
- Event dates and locations
- Ticket type definitions

**tickets/**
- Ticket generation with QR codes
- Ticket validation
- Prevent duplicate scans

**orders/**
- Order creation and tracking
- Purchase management
- Order status updates

**payments/**
- MercadoPago integration
- Payment status tracking
- Transaction confirmation

### Utility Layer (`utils/`)

**AppError.ts**
- Base error class
- Pre-defined HTTP error types
- Operational vs. programming errors

**asyncHandler.ts**
- Wraps async route handlers
- Passes errors to error middleware automatically

**response.ts**
- Consistent success/error response format
- Type-safe response helpers

### Application Layer

**app.ts**
- Express application setup
- Middleware registration
- Route mounting
- Error handling setup

**server.ts**
- HTTP server startup
- Database connection
- Graceful shutdown handling
- Process error handling

## Module Pattern

Each module follows this structure:

```typescript
// {module}.interface.ts
export interface IEntity { ... }
export interface CreateDTO { ... }
export interface UpdateDTO { ... }

// {module}.model.ts (to be added)
import mongoose from 'mongoose';
export const EntityModel = mongoose.model('Entity', EntitySchema);

// {module}.service.ts (to be added)
export class EntityService {
  async create(data: CreateDTO): Promise<IEntity> { ... }
  async findById(id: string): Promise<IEntity> { ... }
}

// {module}.controller.ts
export class EntityController {
  create = asyncHandler(async (req, res) => { ... });
  findById = asyncHandler(async (req, res) => { ... });
}

// {module}.routes.ts
const router = Router();
router.post('/', controller.create);
router.get('/:id', controller.findById);
export default router;

// index.ts
export * from './{module}.interface';
export { default as {module}Routes } from './{module}.routes';
```

## API Route Structure

All routes follow the pattern: `/api/v1/{module}`

```
GET    /health                          # Health check

POST   /api/v1/auth/register           # Register
POST   /api/v1/auth/login              # Login
GET    /api/v1/auth/verify             # Verify token

GET    /api/v1/users                   # List users
GET    /api/v1/users/:id               # Get user
PUT    /api/v1/users/:id               # Update user

GET    /api/v1/events                  # List events
POST   /api/v1/events                  # Create event
GET    /api/v1/events/:id              # Get event
PUT    /api/v1/events/:id              # Update event

GET    /api/v1/tickets                 # List tickets
GET    /api/v1/tickets/:id             # Get ticket
POST   /api/v1/tickets/:id/validate   # Validate ticket

POST   /api/v1/orders                  # Create order
GET    /api/v1/orders/:id              # Get order

POST   /api/v1/payments                # Process payment
GET    /api/v1/payments/:id            # Get payment status
```

## Key Design Principles

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Type Safety**: Full TypeScript strict mode
3. **Error Handling**: Consistent error responses
4. **Security First**: Built-in security middlewares
5. **Scalability**: Modular architecture for easy feature addition
6. **Maintainability**: Clear naming and folder structure
7. **Production Ready**: Environment configuration, graceful shutdown

## Status

✅ Project initialization complete
✅ TypeScript configuration
✅ Express app setup
✅ MongoDB connection
✅ Global error handler
✅ Health check endpoint
✅ Auth module structure
✅ All module structures

⏳ Pending implementation:
- Mongoose models
- Business logic in services
- JWT authentication middleware
- Input validation
- Unit tests
- Integration tests
