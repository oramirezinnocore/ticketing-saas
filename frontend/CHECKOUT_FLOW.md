# Checkout Flow Documentation

## Overview

Complete checkout implementation with MercadoPago integration for ticket purchasing.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Query** - Server state management
- **Zustand** - Client state management (auth + checkout)
- **React Router** - Navigation
- **TailwindCSS** - Styling
- **Axios** - HTTP client
- **date-fns** - Date formatting

## Architecture

```
frontend/src/
├── api/
│   ├── client.ts           # Axios instance with JWT interceptor
│   ├── auth.ts             # Authentication endpoints
│   ├── events.ts           # Events CRUD
│   ├── orders.ts           # Order creation and retrieval
│   ├── payments.ts         # MercadoPago integration
│   └── tickets.ts          # User tickets
├── store/
│   ├── authStore.ts        # JWT + user state
│   └── checkoutStore.ts    # Checkout session state
├── pages/
│   ├── EventDetailPage.tsx        # Ticket selection
│   ├── CheckoutPage.tsx           # Order summary + payment
│   ├── PaymentSuccessPage.tsx     # Success callback
│   ├── PaymentPendingPage.tsx     # Pending callback
│   ├── PaymentFailurePage.tsx     # Failure callback
│   └── TicketsPage.tsx            # User wallet
└── routes/
    └── ProtectedRoute.tsx         # Auth guard
```

## Complete User Flow

### 1. Browse Events

**Route:** `/events`

- User views all available events
- Displays: title, date, price, available tickets
- Click event card → navigate to event detail

### 2. Event Detail & Ticket Selection

**Route:** `/events/:id`

- Event information (title, date, description)
- Ticket type selector with quantity controls
- Real-time price calculation
- Validates availability
- Prevents over-selection

**User Actions:**
- Select ticket quantities
- Click "Buy Tickets" button

**State:**
```typescript
{
  selectedTickets: Record<string, number> // ticketType → quantity
}
```

### 3. Create Order

**API:** `POST /api/v1/orders`

**Request:**
```json
{
  "eventId": "event-id",
  "tickets": [
    { "ticketType": "General Admission", "quantity": 2 },
    { "ticketType": "VIP", "quantity": 1 }
  ]
}
```

**Response:**
```json
{
  "id": "order-id",
  "userId": "user-id",
  "eventId": "event-id",
  "tickets": [...],
  "total": 150.00,
  "status": "pending",
  "expiresAt": "2024-01-15T10:30:00Z",
  "createdAt": "2024-01-15T10:15:00Z"
}
```

**On Success:**
- Navigate to `/checkout/:orderId`

**On Error:**
- Show error message (insufficient inventory, etc.)
- User stays on event page

### 4. Checkout Page

**Route:** `/checkout/:orderId`

**Features:**
- Order summary with line items
- Total price display
- Event details
- Expiration timer (15 minutes)
- "Proceed to Payment" button

**Protected:** Yes (authentication required)

**State Management:**
```typescript
// Zustand checkout store
{
  currentOrder: Order,
  pendingPayment: boolean
}
```

### 5. Create Payment Preference

**User Action:** Click "Proceed to Payment"

**API:** `POST /api/v1/payments/preference`

**Request:**
```json
{
  "orderId": "order-id",
  "description": "Event Name - Tickets",
  "buyerEmail": "user@example.com"
}
```

**Response:**
```json
{
  "preferenceId": "mp-preference-id",
  "initPoint": "https://mercadopago.com/checkout/...",
  "payment": {
    "id": "payment-id",
    "orderId": "order-id",
    "amount": 150.00,
    "status": "pending"
  }
}
```

**On Success:**
- Save order to checkout store
- Redirect to MercadoPago: `window.location.href = initPoint`

### 6. MercadoPago Payment

**External:** User completes payment on MercadoPago

**Possible Outcomes:**
- ✅ **Success** → MercadoPago redirects to `/payment/success?payment_id=xxx`
- ⏳ **Pending** → MercadoPago redirects to `/payment/pending?payment_id=xxx`
- ❌ **Failure** → MercadoPago redirects to `/payment/failure?payment_id=xxx`

**Webhook:** Backend receives webhook from MercadoPago
- Verifies signature
- Updates order status
- Generates tickets (if approved)

### 7. Payment Result Pages

#### Success Page

**Route:** `/payment/success?payment_id=xxx`

**Features:**
- Success icon and message
- Payment details display
- "View My Tickets" CTA
- "Browse More Events" link
- Auto-clear checkout state after 3s

**Query:**
```typescript
useQuery({
  queryKey: ['payment', orderId],
  queryFn: () => paymentsApi.getByOrderId(orderId),
  retry: 3,
  retryDelay: 2000
});
```

#### Pending Page

**Route:** `/payment/pending?payment_id=xxx`

**Features:**
- Pending icon and message
- What happens next explanation
- Payment details
- "Check Status Again" button
- Auto-polling every 5 seconds
- Auto-redirect to success when approved

**Query:**
```typescript
useQuery({
  queryKey: ['payment', orderId],
  queryFn: () => paymentsApi.getByOrderId(orderId),
  refetchInterval: 5000 // Poll every 5s
});
```

#### Failure Page

**Route:** `/payment/failure?payment_id=xxx`

**Features:**
- Error icon and message
- Common failure reasons
- Order details
- "Try Again" button → back to checkout
- "Cancel Order" button → clear state and browse events

### 8. User Wallet (Tickets Page)

**Route:** `/tickets`

**Features:**
- All user tickets grouped by event
- Event details for each group
- Ticket status badges (valid/used)
- QR code placeholder for valid tickets
- Click ticket → modal with full details
- Purchase date display
- Ticket count summary

**Query:**
```typescript
useQuery({
  queryKey: ['my-tickets'],
  queryFn: ticketsApi.getUserTickets
});
```

**Ticket Card Display:**
- Ticket ID
- Status badge
- QR code (for valid tickets)
- Purchase date
- Click to expand modal

**Modal Features:**
- Full event details
- Large QR code display
- Ticket code
- Status
- Close button

## State Management

### Auth Store (Zustand + Persist)

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}
```

**Persisted in:** localStorage (`auth-storage`)

### Checkout Store (Zustand + Persist)

```typescript
interface CheckoutState {
  currentOrder: Order | null;
  pendingPayment: boolean;
  setCurrentOrder: (order: Order) => void;
  setPendingPayment: (pending: boolean) => void;
  clearCheckout: () => void;
}
```

**Persisted in:** localStorage (`checkout-storage`)

**Purpose:**
- Preserve order context during MercadoPago redirect
- Survive page refreshes
- Track pending payments

## API Layer

### Axios Client Configuration

```typescript
// Auto-inject JWT token
interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### API Services

#### Events API
```typescript
eventsApi.getAll() // GET /events
eventsApi.getById(id) // GET /events/:id
```

#### Orders API
```typescript
ordersApi.create(data) // POST /orders
ordersApi.getById(id) // GET /orders/:id
ordersApi.getUserOrders() // GET /orders/user/me
```

#### Payments API
```typescript
paymentsApi.createPreference(data) // POST /payments/preference
paymentsApi.getByOrderId(orderId) // GET /payments/order/:orderId
```

#### Tickets API
```typescript
ticketsApi.getUserTickets() // GET /tickets/user/me
ticketsApi.getByOrderId(orderId) // GET /tickets/order/:orderId
```

## React Query Integration

### Query Keys Convention

```typescript
['events']                  // All events
['event', eventId]          // Single event
['order', orderId]          // Single order
['payment', orderId]        // Payment by order
['my-tickets']              // User tickets
```

### Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});
```

## Security Features

### 1. Authentication Required

All checkout/payment routes protected with `<ProtectedRoute>`:
- Auto-redirect to login if not authenticated
- Preserve intended destination
- Restore session after login

### 2. JWT Auto-Injection

Axios interceptor automatically attaches token to all requests.

### 3. Auto-Logout on 401

If backend returns 401 (invalid/expired token):
- Clear localStorage
- Redirect to login
- User must re-authenticate

### 4. Backend Validation

Frontend sends only:
- Event ID
- Ticket selections (type + quantity)

Backend:
- Validates inventory
- Calculates actual price
- Creates order with server-side total
- Never trusts frontend calculations

### 5. Order Expiration

- Orders expire after 15 minutes
- Frontend shows countdown
- Expired orders cannot be paid
- Inventory automatically recovered

## UX Features

### Loading States

- Skeleton loaders during data fetch
- Animated spinners for mutations
- Disabled buttons during requests
- Loading text feedback

### Error Handling

- Form validation errors
- API error messages
- Network failure states
- Graceful degradation

### Responsive Design

- Mobile-first approach
- Breakpoints: sm, md, lg
- Touch-friendly buttons
- Optimized layouts for all screens

### Empty States

- No events available
- No tickets purchased yet
- Event not found
- Order not found
- Clear CTAs for each state

## Environment Variables

Frontend `.env`:
```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Backend `.env`:
```bash
MERCADOPAGO_ACCESS_TOKEN=your-token
MERCADOPAGO_WEBHOOK_SECRET=your-secret
JWT_SECRET=your-jwt-secret
MONGODB_URI=mongodb://localhost:27017/ticketing
```

## MercadoPago Configuration

### Return URLs

Configure in MercadoPago preference creation:

```typescript
{
  back_urls: {
    success: "http://localhost:5173/payment/success",
    pending: "http://localhost:5173/payment/pending",
    failure: "http://localhost:5173/payment/failure"
  },
  auto_return: "approved"
}
```

**Production:**
Replace with actual domain (e.g., `https://yourdomain.com/payment/success`)

## Testing the Flow

### Local Development

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Flow:**
   - Register/login
   - Browse events
   - Select tickets
   - Create order
   - Proceed to payment
   - Complete on MercadoPago test environment
   - Verify redirect
   - Check tickets in wallet

### MercadoPago Test Credentials

Use MercadoPago sandbox for testing:
- Test cards available in MercadoPago docs
- Simulate approved/pending/rejected payments
- Webhook testing with ngrok

## Production Deployment

### Frontend Checklist

- [ ] Update `VITE_API_BASE_URL` to production API
- [ ] Configure MercadoPago return URLs with production domain
- [ ] Enable production build optimizations
- [ ] Set up CDN for static assets
- [ ] Configure CORS on backend

### Backend Checklist

- [ ] Use production MercadoPago credentials
- [ ] Configure webhook URL (must be HTTPS)
- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Enable MongoDB authentication
- [ ] Set up proper logging
- [ ] Configure rate limiting
- [ ] Enable HTTPS

## Common Issues & Solutions

### Issue: Payment stuck in pending

**Cause:** Webhook not received by backend

**Solution:**
- Verify webhook URL is accessible (use ngrok for local testing)
- Check webhook signature validation
- Review backend logs

### Issue: Order expired before payment

**Cause:** User took longer than 15 minutes

**Solution:**
- User must create new order
- Consider increasing expiration time (not recommended)

### Issue: Tickets not appearing after payment

**Cause:** 
- Webhook failed
- Order status not updated
- Ticket generation error

**Solution:**
- Check backend logs
- Verify webhook processing
- Manual order investigation

### Issue: Token expired during checkout

**Cause:** JWT expired while user on MercadoPago

**Solution:**
- Increase JWT expiration time
- Implement token refresh mechanism
- User must re-authenticate

## Future Enhancements

1. **Real QR Code Generation**
   - Integrate `qrcode.react` library
   - Generate signed QR tokens
   - Implement QR scanner for organizers

2. **Email Notifications**
   - Order confirmation
   - Payment success
   - Ticket delivery
   - Event reminders

3. **PDF Ticket Generation**
   - Download tickets as PDF
   - Print-friendly format
   - Include QR code

4. **Ticket Transfer**
   - Transfer tickets to another user
   - Accept/reject transfer requests
   - Transfer history

5. **Order History**
   - View past orders
   - Reprint tickets
   - Download receipts

6. **Wallet Enhancements**
   - Filter by event status (upcoming/past)
   - Search tickets
   - Calendar integration

7. **Payment Methods**
   - Support multiple payment providers
   - Saved payment methods
   - Split payments

8. **Promo Codes**
   - Discount code system
   - Apply at checkout
   - Usage tracking

## File Structure Summary

```
frontend/
├── src/
│   ├── api/                    # API layer
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── events.ts
│   │   ├── orders.ts
│   │   ├── payments.ts
│   │   └── tickets.ts
│   ├── components/             # Reusable components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Container.tsx
│   │   ├── Input.tsx
│   │   └── Navbar.tsx
│   ├── hooks/                  # Custom hooks
│   │   └── useAuth.ts
│   ├── layouts/                # Layout components
│   │   └── MainLayout.tsx
│   ├── pages/                  # Page components
│   │   ├── HomePage.tsx
│   │   ├── EventsPage.tsx
│   │   ├── EventDetailPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── PaymentSuccessPage.tsx
│   │   ├── PaymentPendingPage.tsx
│   │   ├── PaymentFailurePage.tsx
│   │   ├── TicketsPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── OrganizerDashboard.tsx
│   ├── routes/                 # Route guards
│   │   └── ProtectedRoute.tsx
│   ├── store/                  # State management
│   │   ├── authStore.ts
│   │   └── checkoutStore.ts
│   ├── types/                  # TypeScript types
│   │   └── index.ts
│   ├── App.tsx                 # Root component
│   └── main.tsx                # Entry point
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## Support

For issues or questions:
1. Check backend logs
2. Verify API connectivity
3. Review browser console
4. Check network tab for failed requests
5. Verify environment variables
