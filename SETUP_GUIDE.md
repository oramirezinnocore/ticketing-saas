# Ticketing SaaS - Complete Setup Guide

## Prerequisites

- Node.js 18+ and npm
- MongoDB 5.0+
- MercadoPago account (sandbox for development)

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Backend `.env` Configuration:**

```bash
# Server
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/ticketing-saas

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=your-mercadopago-access-token
MERCADOPAGO_WEBHOOK_SECRET=your-webhook-secret

# Frontend (for CORS)
FRONTEND_URL=http://localhost:5173
```

**Start Backend:**

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm start
```

Backend runs on: `http://localhost:3000`

Health check: `http://localhost:3000/health`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env
nano .env
```

**Frontend `.env` Configuration:**

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

**Start Frontend:**

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm run preview
```

Frontend runs on: `http://localhost:5173`

### 3. MongoDB Setup

**Option A: Local MongoDB**

```bash
# Install MongoDB (macOS with Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify connection
mongosh
```

**Option B: MongoDB Atlas (Cloud)**

1. Create free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create new cluster
3. Get connection string
4. Update `MONGODB_URI` in backend `.env`

### 4. MercadoPago Setup

**Development (Sandbox):**

1. Go to [MercadoPago Developers](https://www.mercadopago.com/developers)
2. Login or create account
3. Navigate to "Your integrations" → "Credentials"
4. Copy **Test Public Key** and **Test Access Token**
5. Add Access Token to backend `.env`
6. Generate Webhook Secret (random 32+ char string)

**Webhook Configuration:**

For local development, use [ngrok](https://ngrok.com/):

```bash
# Install ngrok
brew install ngrok

# Start ngrok tunnel
ngrok http 3000

# Copy HTTPS URL (e.g., https://abc123.ngrok.io)
```

Configure webhook in MercadoPago dashboard:
- URL: `https://abc123.ngrok.io/api/v1/payments/webhook`
- Events: Payment updates

**Production:**

1. Switch to Production credentials in MercadoPago dashboard
2. Update `MERCADOPAGO_ACCESS_TOKEN` with production token
3. Configure webhook with production domain

## Testing the Complete Flow

### Step 1: Create Test User

```bash
# Using the API directly
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Or use the frontend registration form.

### Step 2: Create Test Event (Organizer)

First, create an organizer user:

```bash
# Register organizer
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Event Organizer",
    "email": "organizer@example.com",
    "password": "password123"
  }'
```

Manually update user role in MongoDB:

```bash
mongosh
use ticketing-saas
db.users.updateOne(
  { email: "organizer@example.com" },
  { $set: { role: "organizer" } }
)
```

Login as organizer and create event via `/organizer` dashboard.

### Step 3: Purchase Flow Test

1. **Browse Events:** Go to `/events`
2. **Select Event:** Click on an event
3. **Select Tickets:** Choose quantities
4. **Checkout:** Click "Buy Tickets"
5. **Payment:** Complete MercadoPago test payment
6. **Result:** Verify redirect to success page
7. **Wallet:** Check tickets in `/tickets`

### MercadoPago Test Cards

**Approved Payment:**
- Card: `5031 7557 3453 0604`
- CVV: `123`
- Expiry: Any future date
- Name: `APRO`

**Pending Payment:**
- Card: `5031 7557 3453 0604`
- Name: `CONT`

**Rejected Payment:**
- Card: `5031 7557 3453 0604`
- Name: `OTHE`

## Project Structure

```
ticketing-saas/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── modules/           # Feature modules
│   │   │   ├── auth/
│   │   │   ├── events/
│   │   │   ├── orders/
│   │   │   ├── payments/
│   │   │   ├── tickets/
│   │   │   └── users/
│   │   ├── middlewares/       # Express middlewares
│   │   ├── config/            # Configuration
│   │   ├── utils/             # Utilities
│   │   └── app.ts             # Express app
│   └── package.json
├── frontend/                   # React/TypeScript
│   ├── src/
│   │   ├── api/               # API client
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── store/             # Zustand stores
│   │   ├── hooks/             # Custom hooks
│   │   ├── routes/            # Route guards
│   │   └── types/             # TypeScript types
│   └── package.json
└── docs/                       # Documentation
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user (protected)

### Events

- `GET /api/v1/events` - List all events
- `GET /api/v1/events/:id` - Get event by ID
- `POST /api/v1/events` - Create event (organizer/admin)
- `PATCH /api/v1/events/:id` - Update event (organizer/admin)
- `DELETE /api/v1/events/:id` - Delete event (organizer/admin)

### Orders

- `POST /api/v1/orders` - Create order (authenticated)
- `GET /api/v1/orders/:id` - Get order by ID (authenticated)
- `GET /api/v1/orders/user/me` - Get user's orders (authenticated)

### Payments

- `POST /api/v1/payments/preference` - Create MercadoPago preference (authenticated)
- `POST /api/v1/payments/webhook` - MercadoPago webhook (public)
- `GET /api/v1/payments/order/:orderId` - Get payment by order (authenticated)

### Tickets

- `GET /api/v1/tickets/user/me` - Get user's tickets (authenticated)
- `GET /api/v1/tickets/order/:orderId` - Get tickets by order (authenticated)

## Environment Variables

### Backend Required

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` or `production` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection | `mongodb://localhost:27017/ticketing-saas` |
| `JWT_SECRET` | JWT signing key (32+ chars) | `your-secret-key-here` |
| `JWT_EXPIRES_IN` | JWT expiration | `7d` |
| `MERCADOPAGO_ACCESS_TOKEN` | MercadoPago token | Your token |
| `MERCADOPAGO_WEBHOOK_SECRET` | Webhook secret | Your secret |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Frontend Required

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:3000/api/v1` |

## Common Issues

### Backend won't start

**Error:** `Missing required environment variables`

**Solution:** Verify all required variables in `.env`

**Error:** `Cannot connect to MongoDB`

**Solution:**
- Check MongoDB is running: `brew services list`
- Verify `MONGODB_URI` is correct
- Test connection with `mongosh`

### Frontend can't connect to backend

**Error:** `Network Error` or `CORS Error`

**Solution:**
- Verify backend is running on port 3000
- Check `VITE_API_BASE_URL` in frontend `.env`
- Ensure `FRONTEND_URL` is set correctly in backend `.env`

### Payment webhook not working

**Error:** Webhook not received

**Solution:**
- Use ngrok for local testing
- Verify webhook URL in MercadoPago dashboard
- Check webhook signature validation
- Review backend logs

### Order expires too quickly

**Issue:** Users don't have enough time to complete payment

**Solution:**
- Increase expiration time in `backend/src/modules/orders/order.service.ts`
- Default is 15 minutes
- Change: `expiresAt.setMinutes(expiresAt.getMinutes() + 15);`

## Security Checklist

### Development

- ✅ JWT secret is at least 32 characters
- ✅ Environment variables not committed to git
- ✅ CORS configured for localhost
- ✅ Rate limiting enabled
- ✅ Helmet security headers enabled

### Production

- ✅ Use strong JWT secret (64+ characters)
- ✅ Enable HTTPS on backend
- ✅ Configure CORS for production domain only
- ✅ Use MongoDB authentication
- ✅ Use production MercadoPago credentials
- ✅ Configure proper webhook URL (HTTPS required)
- ✅ Enable request logging
- ✅ Set up error monitoring (e.g., Sentry)
- ✅ Regular database backups
- ✅ Environment variables stored securely

## Deployment

### Backend Deployment (Railway/Render/Heroku)

1. Create new project
2. Connect GitHub repository
3. Add environment variables
4. Deploy from `backend` directory
5. Configure MongoDB Atlas connection
6. Set up MercadoPago production webhook

### Frontend Deployment (Vercel/Netlify)

1. Create new project
2. Connect GitHub repository
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_API_BASE_URL`
6. Deploy

### Database Hosting (MongoDB Atlas)

1. Create cluster (free tier available)
2. Configure IP whitelist (allow from anywhere for development)
3. Create database user
4. Get connection string
5. Update backend `MONGODB_URI`

## Scripts

### Backend

```json
{
  "dev": "tsx watch src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "lint": "eslint .",
  "type-check": "tsc --noEmit"
}
```

### Frontend

```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext ts,tsx",
  "type-check": "tsc --noEmit"
}
```

## Development Workflow

1. **Start MongoDB:** `brew services start mongodb-community`
2. **Start Backend:** `cd backend && npm run dev`
3. **Start Frontend:** `cd frontend && npm run dev`
4. **Start ngrok (if testing webhooks):** `ngrok http 3000`
5. **Code:** Make changes, hot reload enabled
6. **Test:** Manual testing or automated tests
7. **Commit:** `git add . && git commit -m "message"`

## Testing

### Manual Testing Checklist

- [ ] User registration
- [ ] User login
- [ ] Browse events
- [ ] View event details
- [ ] Select tickets
- [ ] Create order
- [ ] Complete payment (approved)
- [ ] Test pending payment
- [ ] Test failed payment
- [ ] View tickets in wallet
- [ ] Organizer can create events
- [ ] Order expiration works
- [ ] Protected routes redirect to login

### API Testing with cURL

See individual endpoint examples in `CHECKOUT_FLOW.md`

## Support & Resources

- **Backend Documentation:** `backend/README.md`
- **Frontend Documentation:** `frontend/CHECKOUT_FLOW.md`
- **Architecture Docs:** `docs/doc_architecture.md`
- **MercadoPago Docs:** [MercadoPago Developer Docs](https://www.mercadopago.com/developers)
- **React Query Docs:** [TanStack Query](https://tanstack.com/query)
- **Zustand Docs:** [Zustand](https://github.com/pmndrs/zustand)

## Next Steps

1. ✅ Complete basic setup
2. ✅ Implement checkout flow
3. ⏳ Add QR code generation
4. ⏳ Implement email notifications
5. ⏳ Add ticket transfer feature
6. ⏳ Create organizer analytics dashboard
7. ⏳ Implement promo codes
8. ⏳ Add refund functionality

## License

MIT
