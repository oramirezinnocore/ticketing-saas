# Payment Module - MercadoPago Integration

## Overview

This module handles payment processing using MercadoPago, including payment preference creation, webhook handling, order status updates, and automatic ticket generation.

## Architecture

```
Payment Flow:
1. User creates order (OrderService) → status: PENDING
2. Create payment preference (PaymentService.createPaymentPreference)
3. User completes payment on MercadoPago
4. MercadoPago sends webhook (PaymentService.processWebhook)
5. Webhook updates order → status: PAID
6. Automatically triggers ticket generation (TicketService.issueTicketsForPaidOrder)
7. Tickets are ready for the user
```

## Key Features

### ✅ Secure Webhook Handling
- **HMAC Signature Verification**: Uses `x-signature` header with SHA-256
- **Timing-Safe Comparison**: Prevents timing attacks
- **Idempotent Processing**: Uses `webhookProcessed` flag to prevent duplicate processing

### ✅ Idempotent Operations
- **Duplicate Prevention**: Checks if webhook already processed
- **Transaction Safety**: Uses MongoDB transactions for atomicity
- **Unique External IDs**: MercadoPago payment ID stored as unique constraint

### ✅ Clean Architecture
- **Service Layer**: Business logic separated from controllers
- **Dependency Injection**: TicketService injected into PaymentService
- **Error Handling**: Custom error classes for different scenarios
- **Type Safety**: Full TypeScript interfaces

### ✅ Automatic Workflows
- **Payment Approved** → Order status to PAID → Generate tickets
- **Payment Rejected** → Order status to CANCELLED
- **Payment Refunded** → Payment status to REFUNDED

## Files

```
payments/
├── payment.interface.ts    # TypeScript interfaces and enums
├── payment.model.ts        # Mongoose schema with indexes
├── payment.service.ts      # Business logic and MercadoPago integration
├── payment.controller.ts   # HTTP request handlers
├── payment.routes.ts       # API route definitions
├── index.ts               # Module exports
└── README.md              # This file
```

## API Endpoints

### 1. Create Payment Preference

**POST** `/api/v1/payments/preference`

Creates a MercadoPago payment preference and returns the checkout URL.

**Request:**
```json
{
  "orderId": "507f1f77bcf86cd799439011",
  "description": "Tickets for Event Name",
  "buyerEmail": "buyer@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "preferenceId": "123456789-abc-def",
    "initPoint": "https://www.mercadopago.com/mla/checkout/start?pref_id=...",
    "payment": {
      "id": "60a7b8c9d0e1f2a3b4c5d6e7",
      "orderId": "507f1f77bcf86cd799439011",
      "amount": 1500,
      "status": "pending",
      "paymentMethod": "mercadopago",
      "webhookProcessed": false,
      "createdAt": "2026-05-07T...",
      "updatedAt": "2026-05-07T..."
    }
  }
}
```

### 2. Webhook Endpoint

**POST** `/api/v1/payments/webhook`

Receives MercadoPago notifications for payment status changes.

**Headers:**
- `x-signature`: HMAC-SHA256 signature for verification

**Request (from MercadoPago):**
```json
{
  "action": "payment.updated",
  "api_version": "v1",
  "data": {
    "id": "12345678"
  },
  "date_created": "2026-05-07T12:00:00Z",
  "id": 123456,
  "live_mode": true,
  "type": "payment",
  "user_id": "987654"
}
```

**Response:**
```
200 OK
```

### 3. Get Payment by Order ID

**GET** `/api/v1/payments/order/:orderId`

Retrieves the most recent payment for an order.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "60a7b8c9d0e1f2a3b4c5d6e7",
    "orderId": "507f1f77bcf86cd799439011",
    "amount": 1500,
    "status": "approved",
    "paymentMethod": "credit_card",
    "externalId": "12345678",
    "webhookProcessed": true,
    "createdAt": "2026-05-07T...",
    "updatedAt": "2026-05-07T..."
  }
}
```

### 4. Get Payment by ID

**GET** `/api/v1/payments/:id`

Retrieves a specific payment by its ID.

## Payment Statuses

| Status | Description |
|--------|-------------|
| `pending` | Payment initiated but not yet completed |
| `approved` | Payment successful |
| `rejected` | Payment declined or failed |
| `refunded` | Payment refunded to customer |

## Environment Variables

Add to `.env`:

```env
# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=your-access-token-from-mercadopago
MERCADOPAGO_WEBHOOK_SECRET=your-secret-key-for-signature

# URLs
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

### Getting MercadoPago Credentials

1. Create account at https://www.mercadopago.com
2. Go to **Developers** → **Your Integrations**
3. Create new application
4. Copy **Access Token** (production or test)
5. Generate **Webhook Secret** for signature verification

## Security Features

### 1. Webhook Signature Verification

```typescript
verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = this.getWebhookSecret();
  const hmac = crypto.createHmac('sha256', secret);
  const expectedSignature = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### 2. Idempotent Processing

- **Check before processing**: Query `webhookProcessed: true` with `externalId`
- **Atomic updates**: Use MongoDB transactions
- **Unique constraints**: Prevent duplicate payments with same `externalId`

### 3. Transaction Safety

All critical operations wrapped in MongoDB transactions:
- Payment status update
- Order status update
- Ticket generation

If any step fails, entire transaction is rolled back.

## Database Schema

### Payment Collection

```typescript
{
  orderId: ObjectId,           // Reference to Order
  amount: Number,              // Payment amount
  status: String,              // pending | approved | rejected | refunded
  paymentMethod: String,       // Payment method from MercadoPago
  externalId: String,          // MercadoPago payment ID (unique)
  webhookProcessed: Boolean,   // Idempotency flag
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `orderId` (single)
- `externalId` (unique, sparse)
- `webhookProcessed` (single)
- `orderId + status` (compound)
- `externalId + webhookProcessed` (compound)

## Usage Example

### Complete Flow

```typescript
import { PaymentService } from './modules/payments';
import { OrderService } from './modules/orders';

// 1. Create order
const orderService = new OrderService();
const order = await orderService.createOrder({
  userId: '507f1f77bcf86cd799439011',
  eventId: '507f191e810c19729de860ea',
  tickets: [
    { ticketType: 'General', quantity: 2 },
    { ticketType: 'VIP', quantity: 1 }
  ]
});
// Order status: PENDING

// 2. Create payment preference
const paymentService = new PaymentService();
const result = await paymentService.createPaymentPreference({
  orderId: order.id,
  amount: order.total,
  description: 'Event Tickets',
  buyerEmail: 'buyer@example.com'
});

// 3. Redirect user to MercadoPago
// window.location.href = result.initPoint;

// 4. MercadoPago sends webhook (automatic)
// PaymentService.processWebhook() is called
// → Order status: PAID
// → Tickets automatically generated

// 5. User receives tickets
const tickets = await ticketService.issueTicketsForPaidOrder(order.id);
```

## Error Handling

| Error Type | HTTP Status | Description |
|------------|-------------|-------------|
| `BadRequestError` | 400 | Invalid order ID, missing fields |
| `NotFoundError` | 404 | Order or payment not found |
| `ConflictError` | 409 | Payment already exists for order |
| `InternalServerError` | 500 | MercadoPago API error |

## Testing

### Test Webhook Locally

```bash
# Use ngrok to expose local server
ngrok http 5000

# Copy ngrok URL and configure in MercadoPago dashboard
# Webhook URL: https://your-ngrok-url.ngrok.io/api/v1/payments/webhook
```

### MercadoPago Test Credentials

Use MercadoPago sandbox mode:
- Test cards: https://www.mercadopago.com/developers/en/docs/checkout-pro/additional-content/test-cards
- Test email: `test_user_123456@testuser.com`

## Monitoring

### Key Metrics to Track

1. **Webhook Processing Time**: Should complete in < 5 seconds
2. **Failed Webhooks**: Monitor for signature verification failures
3. **Duplicate Prevention**: Count of idempotent blocks
4. **Payment Status Distribution**: approved vs rejected ratio

### Logging

Service logs:
- ✅ Payment preference created
- ✅ Webhook received (with external ID)
- ✅ Payment status changed
- ✅ Order updated
- ✅ Tickets generated
- ❌ Webhook signature failed
- ❌ MercadoPago API error

## Production Checklist

- [ ] Use production MercadoPago credentials
- [ ] Set strong `MERCADOPAGO_WEBHOOK_SECRET`
- [ ] Configure proper `BACKEND_URL` (HTTPS)
- [ ] Enable webhook signature verification
- [ ] Set up monitoring for failed webhooks
- [ ] Configure retry logic for failed ticket generation
- [ ] Add logging for all payment state changes
- [ ] Test refund flow
- [ ] Document payment reconciliation process

## Future Enhancements

- [ ] Payment retry mechanism
- [ ] Partial refunds support
- [ ] Multiple payment methods per order
- [ ] Payment analytics dashboard
- [ ] Webhook replay endpoint for debugging
- [ ] Payment expiration handling
- [ ] Email notifications on payment status
