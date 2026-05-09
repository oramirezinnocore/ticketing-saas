# Security Quick Reference

## 🔐 Authentication & Authorization

### Protect Routes

```typescript
import { authenticate, authorize } from './middlewares';

// Authentication only
router.get('/profile', authenticate, userController.getProfile);

// Organizer or Admin only
router.post(
  '/events',
  authenticate,
  authorize('organizer', 'admin'),
  eventController.create
);

// Admin only
router.delete(
  '/users/:id',
  authenticate,
  authorize('admin'),
  userController.delete
);
```

### Access User in Controller

```typescript
export class UserController {
  getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId; // Type-safe
    const userRole = req.user?.role;
    // ... fetch user profile
  });
}
```

---

## 🎫 Signed QR Codes

### Generate Signed Token

```typescript
import { QRService } from './modules/tickets';

const qrService = new QRService();

// Generate token (5 minutes expiry by default)
const signedToken = qrService.generateSignedTicketToken(ticket.code);

// Custom expiry (10 minutes)
const signedToken = qrService.generateSignedTicketToken(ticket.code, 600);

// Display signedToken as QR code to user
```

### Validate QR Token (Scanner Flow)

```typescript
import { QRService, TicketService } from './modules/tickets';

const qrService = new QRService();
const ticketService = new TicketService();

// 1. Verify signature and extract code
const ticketCode = qrService.verifySignedTicketToken(scannedToken);

// 2. Validate ticket (atomic - prevents race conditions)
const ticket = await ticketService.markTicketUsed(ticketCode);

// Success: ticket marked as USED
```

**Errors:**
- `UnauthorizedError: QR token has expired` - Token older than 5 minutes
- `UnauthorizedError: Invalid QR token` - Tampered or malformed token
- `ConflictError: Ticket has already been used` - Already scanned
- `NotFoundError: Ticket not found` - Invalid ticket code

---

## 💰 Payment Webhooks

### Webhook Flow

```
1. MercadoPago sends webhook → POST /api/v1/payments/webhook
2. Verify signature (mandatory)
3. Fetch payment details from MercadoPago
4. Validate amount matches order.total
5. Update payment status
6. Update order status → PAID
7. Generate tickets automatically
```

### Security Features

✅ **Mandatory Signature** - Unsigned webhooks rejected  
✅ **Amount Validation** - Detects price tampering  
✅ **Idempotent** - Safe to process multiple times  
✅ **Transactional** - All-or-nothing updates  
✅ **Fraud Logging** - Amount mismatches logged with details

### Webhook Errors

- `BadRequestError: Missing webhook signature` - No x-signature header
- `BadRequestError: Invalid webhook signature` - Signature verification failed
- `ConflictError: Payment amount mismatch` - Transaction amount ≠ order total
- `NotFoundError: Payment record not found` - Payment not created via preference

---

## 📦 Order Expiration

### Automatic Expiration

```typescript
// Orders expire 15 minutes after creation
const order = await orderService.createOrder({
  userId,
  eventId,
  tickets: [{ ticketType: 'General', quantity: 2 }]
});

// order.expiresAt → 15 minutes from now
```

### Manual Cleanup (Cron Job)

```bash
# Run every 5 minutes
*/5 * * * * cd /app/backend && node dist/scripts/cleanupExpiredOrders.js

# Or manually
npm run build
node dist/scripts/cleanupExpiredOrders.js
```

### What Happens on Expiration?

1. Order status → CANCELLED
2. Inventory restored transactionally
3. ticketTypes.quantityAvailable incremented
4. Idempotent (safe if order already processed)

---

## 📊 Structured Logging

### Import Logger

```typescript
import { logger } from './utils/logger';
```

### Log Examples

```typescript
// Info log
logger.info({ orderId, amount }, 'Payment created');

// Error log
logger.error({ err: error, orderId }, 'Payment processing failed');

// Fraud detection
logger.error({
  orderId,
  expectedAmount: 1500,
  receivedAmount: 1000,
  difference: 500
}, 'Payment amount mismatch - potential fraud');

// Ticket validation
logger.info({
  ticketId: ticket.id,
  eventId: ticket.eventId,
  userId: ticket.userId
}, 'Ticket validated and marked as USED');

// Debugging
logger.debug({ data }, 'Processing webhook payload');
```

### Log Levels

- `logger.debug()` - Development debugging
- `logger.info()` - General information
- `logger.warn()` - Warnings (non-critical)
- `logger.error()` - Errors (requires attention)

### Production Logs

```json
{
  "level": "info",
  "time": "2026-05-08T10:30:45.123Z",
  "orderId": "507f1f77bcf86cd799439011",
  "amount": 1500,
  "msg": "Payment created"
}
```

---

## ⚙️ Environment Variables

### Critical Variables (Required)

```bash
# Will fail to start if missing
JWT_SECRET=<32+ characters minimum>
MONGODB_URI=mongodb://localhost:27017/ticketing-saas
MERCADOPAGO_ACCESS_TOKEN=<your-access-token>
MERCADOPAGO_WEBHOOK_SECRET=<your-webhook-secret>
```

### Optional Variables

```bash
NODE_ENV=development
PORT=5000
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=debug
```

### Validation

Environment variables validated on startup:
- Missing critical vars → Error with list of missing vars
- JWT_SECRET < 32 chars → Error enforcing strong secret
- Clear error messages for troubleshooting

---

## 🎯 Common Patterns

### Transactional Operations

```typescript
const session = await mongoose.startSession();

try {
  await session.withTransaction(async () => {
    // All operations succeed or all fail
    await Order.updateOne({ _id: orderId }, { status: 'PAID' }, { session });
    await Payment.updateOne({ orderId }, { status: 'APPROVED' }, { session });
    await ticketService.issueTickets(orderId); // Also uses session
  });
} finally {
  await session.endSession();
}
```

### Atomic Updates (Concurrency-Safe)

```typescript
// Prevents race conditions
const ticket = await Ticket.findOneAndUpdate(
  { code: ticketCode, status: TicketStatus.VALID },
  { $set: { status: TicketStatus.USED } },
  { new: true }
);

if (!ticket) {
  // Already used or not found
  throw new ConflictError('Ticket already used');
}
```

### Error Handling

```typescript
import { BadRequestError, UnauthorizedError, NotFoundError } from './utils/AppError';

// Validation errors
if (!email || !password) {
  throw new BadRequestError('Email and password are required');
}

// Authentication errors
if (!isValidToken) {
  throw new UnauthorizedError('Invalid token');
}

// Not found errors
if (!user) {
  throw new NotFoundError('User not found');
}
```

---

## 🚨 Security Checklist

### Before Production

- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Configure production MercadoPago credentials
- [ ] Set MERCADOPAGO_WEBHOOK_SECRET
- [ ] Use HTTPS for BACKEND_URL
- [ ] Set LOG_LEVEL=info
- [ ] Configure webhook URL in MercadoPago dashboard
- [ ] Test webhook signature verification
- [ ] Setup cron for inventory cleanup
- [ ] Enable monitoring for fraud logs

### Monitoring

- [ ] Alert on payment amount mismatches (fraud)
- [ ] Alert on webhook signature failures (attacks)
- [ ] Monitor ticket double-scan attempts
- [ ] Track expired order cleanup metrics
- [ ] Monitor QR token expiration errors

### Testing

```bash
# Type safety
npm run type-check

# Linting
npm run lint

# Build
npm run build

# Start with validation
npm run dev
# Should show: "Server started successfully"

# Test missing env var
unset JWT_SECRET && npm run dev
# Should fail: "CRITICAL: Missing required environment variables: JWT_SECRET"
```

---

## 📖 Additional Documentation

- [SECURITY_HARDENING.md](SECURITY_HARDENING.md) - Complete implementation details
- [README.md](README.md) - General project documentation
- [PAYMENT_INTEGRATION_SUMMARY.md](PAYMENT_INTEGRATION_SUMMARY.md) - Payment flow details

---

## 🆘 Troubleshooting

### Webhook Signature Verification Fails

**Problem:** `BadRequestError: Invalid webhook signature`

**Solution:**
1. Check MERCADOPAGO_WEBHOOK_SECRET is correct
2. Verify webhook URL in MercadoPago dashboard
3. Test signature locally with sample payload
4. Check for URL encoding issues

### Payment Amount Mismatch

**Problem:** `ConflictError: Payment amount mismatch`

**Cause:** Fraud attempt or order.total calculation error

**Action:**
1. Check logs for expected vs received amount
2. Verify order.total calculation logic
3. Review event ticket prices
4. Investigate user for fraud patterns

### Ticket Already Used

**Problem:** `ConflictError: Ticket has already been used`

**Cause:** Duplicate scan attempt or race condition (now prevented)

**Action:**
1. Check ticket.status in database
2. Review scanner logs for duplicate scans
3. Confirm atomic update is in place (no race)

### QR Token Expired

**Problem:** `UnauthorizedError: QR token has expired`

**Cause:** QR code older than 5 minutes

**Action:**
1. Regenerate QR code for user
2. Consider increasing expiry if needed (balance security vs UX)
3. Ensure clocks synchronized

### Order Not Expiring

**Problem:** Pending orders not being cleaned up

**Solution:**
1. Check cron job is running: `crontab -l`
2. Manually run: `node dist/scripts/cleanupExpiredOrders.js`
3. Check logs for errors
4. Verify expiresAt field exists on orders

---

**Last Updated:** 2026-05-08  
**Version:** 1.0.0
