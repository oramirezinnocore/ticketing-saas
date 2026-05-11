# Complete Ticket Purchase Lifecycle - Implementation Guide

## ✅ IMPLEMENTATION COMPLETE

Full end-to-end ticket purchase → payment → issuance → validation flow.

---

## 🎯 Complete Purchase Flow

### Step-by-Step User Journey

```
1. User browses events → /events
2. User selects event → /events/:id
3. User adds tickets to cart
4. User clicks "Buy Tickets"
   └─> Creates order (status: PENDING)
   └─> Redirects to /checkout/:orderId

5. User clicks "Pay with MercadoPago"
   └─> Backend creates Payment (status: PENDING)
   └─> Backend creates MercadoPago preference
   └─> User redirected to MercadoPago checkout page

6. User completes payment on MercadoPago
   └─> MercadoPago sends webhook to backend
   └─> Backend validates webhook signature
   └─> Backend fetches payment details from MercadoPago API

7. Backend processes payment (ATOMIC TRANSACTION)
   └─> Updates Payment (status: APPROVED, externalId: MP payment ID)
   └─> Updates Order (status: PAID)
   └─> Issues tickets automatically
   └─> Generates unique ticket codes
   └─> Creates Ticket records (one per quantity)

8. User redirected to /payment/success
   └─> User can view tickets at /my-tickets
   └─> Each ticket has QR code with signed JWT token
```

---

## 📋 Database Schema

### Order Status Lifecycle

```typescript
enum OrderStatus {
  PENDING = 'pending',    // Initial state after order creation
  PAID = 'paid',          // Payment approved, tickets issued
  CANCELLED = 'cancelled', // Payment rejected or order expired
  REFUNDED = 'refunded',   // Payment refunded (future)
}
```

### Payment Status Lifecycle

```typescript
enum PaymentStatus {
  PENDING = 'pending',     // Waiting for payment
  APPROVED = 'approved',   // Payment successful
  REJECTED = 'rejected',   // Payment failed/declined
  REFUNDED = 'refunded',   // Payment refunded (future)
}
```

### Ticket Status Lifecycle

```typescript
enum TicketStatus {
  VALID = 'valid',  // Can be used for entry
  USED = 'used',    // Already scanned/validated
}
```

---

## 🔐 Part 1: Payment Status Flow

### Payment Lifecycle Implementation

**File:** `backend/src/modules/payments/payment.service.ts`

#### Create Payment Preference

```typescript
async createPaymentPreference(data: CreatePaymentPreferenceDTO)
```

**What it does:**
1. Validates order exists and is PENDING
2. Checks no duplicate payment exists
3. Creates MercadoPago preference with:
   - Order amount
   - Event description
   - Buyer email
   - Callback URLs (success/failure/pending)
   - Webhook notification URL
   - External reference (orderId)
4. Creates Payment record (status: PENDING)
5. Returns preference ID and checkout URL (init_point)

**Response:**
```json
{
  "preferenceId": "1234567890-abc123",
  "initPoint": "https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=...",
  "payment": {
    "id": "...",
    "orderId": "...",
    "amount": 1500.00,
    "status": "pending",
    "paymentMethod": "mercadopago"
  }
}
```

---

## 🪝 Part 2: MercadoPago Webhook

### Webhook Processing (Idempotent)

**Endpoint:** `POST /api/v1/payments/webhook`

**File:** `backend/src/modules/payments/payment.service.ts`

#### Security Validations

1. **Signature Verification**
   ```typescript
   verifyWebhookSignature(payload: string, signature: string): boolean
   ```
   - Uses HMAC-SHA256
   - Compares with `x-signature` header
   - Timing-safe comparison prevents timing attacks

2. **Idempotency Check**
   ```typescript
   const existingPayment = await Payment.findOne({
     externalId: paymentId,
     webhookProcessed: true,
   });

   if (existingPayment) {
     // Skip processing - already handled
     return;
   }
   ```

#### Webhook Processing Flow

```typescript
async processWebhook(webhookPayload: MercadoPagoWebhookPayload)
```

**Steps:**

1. **Filter webhook type**
   - Only process `type: "payment"` webhooks
   - Ignore other types (subscription, chargebacks, etc.)

2. **Fetch payment details from MercadoPago**
   ```typescript
   GET /v1/payments/:id
   ```
   - Gets authoritative payment status
   - Never trust webhook payload alone

3. **Extract order reference**
   ```typescript
   const orderId = paymentDetail.external_reference;
   ```

4. **Atomic transaction** (MongoDB session)
   ```typescript
   await session.withTransaction(async () => {
     // All operations succeed or all fail
   });
   ```

5. **Update payment record**
   - Set `externalId` (MercadoPago payment ID)
   - Set `status` (mapped from MP status)
   - Set `webhookProcessed: true` (idempotency flag)
   - Set `amount` (actual amount charged)

6. **Validate payment amount**
   ```typescript
   const amountDiff = Math.abs(paymentDetail.transaction_amount - order.total);
   if (amountDiff > 0.01) {
     // FRAUD DETECTION
     payment.status = PaymentStatus.REJECTED;
     throw new ConflictError('Payment amount mismatch');
   }
   ```

7. **Update order status**
   - If payment APPROVED → Order becomes PAID
   - If payment REJECTED → Order becomes CANCELLED

8. **Issue tickets automatically**
   ```typescript
   await this.ticketService.issueTicketsForPaidOrder(orderId);
   ```

#### Status Mapping

```typescript
private mapMercadoPagoStatus(mpStatus: string): PaymentStatus {
  switch (mpStatus) {
    case 'approved':
      return PaymentStatus.APPROVED;
    case 'rejected':
    case 'cancelled':
      return PaymentStatus.REJECTED;
    case 'refunded':
      return PaymentStatus.REFUNDED;
    default:
      return PaymentStatus.PENDING;
  }
}
```

---

## 🎟️ Part 3: Automatic Ticket Issuance

### Ticket Generation Service

**File:** `backend/src/modules/tickets/ticket.service.ts`

#### Issue Tickets for Paid Order

```typescript
async issueTicketsForPaidOrder(orderId: string): Promise<ITicket[]>
```

**Idempotent Operation:**
- If tickets already exist for order → return existing tickets
- Prevents duplicate ticket generation on webhook retries

**Steps:**

1. **Validate order is PAID**
   ```typescript
   if (order.status !== OrderStatus.PAID) {
     throw new BadRequestError('Tickets can only be issued for paid orders');
   }
   ```

2. **Check for existing tickets** (idempotency)
   ```typescript
   const existing = await Ticket.find({ orderId });
   if (existing.length > 0) {
     return existing; // Already issued
   }
   ```

3. **Calculate total ticket quantity**
   ```typescript
   const totalUnits = order.tickets.reduce((sum, line) => sum + line.quantity, 0);
   ```

   Example:
   ```json
   {
     "tickets": [
       { "ticketType": "General Admission", "quantity": 2 },
       { "ticketType": "VIP", "quantity": 1 }
     ]
   }
   // totalUnits = 3 tickets
   ```

4. **Generate unique ticket codes**
   ```typescript
   generateTicketCode(): string {
     return crypto.randomBytes(18).toString('base64url');
   }
   ```

   Properties:
   - **Length:** 24 characters
   - **Encoding:** base64url (URL-safe)
   - **Entropy:** 144 bits (cryptographically strong)
   - **Collisions:** Virtually impossible

   Example code: `xK3mN9pQrLz8vF2jW7yH4s`

5. **Create ticket documents**
   ```typescript
   const docs = Array.from(codes).map((code) => ({
     code,
     orderId: order._id,
     eventId: order.eventId,
     userId: order.userId,
     status: TicketStatus.VALID,
   }));

   await Ticket.insertMany(docs, { session });
   ```

6. **Handle code collisions**
   ```typescript
   catch (err) {
     if (err.code === 11000) { // MongoDB duplicate key error
       throw new ConflictError('Ticket code collision; retry issue operation');
     }
   }
   ```

**Result:**
- Returns array of `ITicket` objects
- One ticket per quantity unit
- Each with unique code
- All linked to order, event, and user

---

## 🔲 Part 4: QR Code Generation

### QR Service Implementation

**File:** `backend/src/modules/tickets/qr.service.ts`

#### Generate Signed Ticket Token

```typescript
generateSignedTicketToken(ticketCode: string, expiresInSeconds = 300): string
```

**What it does:**
1. Takes raw ticket code
2. Creates JWT payload: `{ ticketCode: "xK3mN9pQrLz8vF2jW7yH4s" }`
3. Signs with JWT_SECRET
4. Sets expiration (default: 5 minutes)
5. Returns signed JWT token

**Why JWT?**
- **Tamper-proof:** Cannot forge without secret
- **Self-contained:** Includes expiration
- **Stateless:** No database lookup for validation
- **Short-lived:** 5-minute expiration prevents screenshot attacks

#### Verify Signed Ticket Token

```typescript
verifySignedTicketToken(token: string): string
```

**Validation checks:**
1. Signature verification (uses JWT_SECRET)
2. Expiration check (token must not be expired)
3. Payload validation (must contain ticketCode)

**Returns:** Raw ticket code (if valid)

**Throws:**
- `UnauthorizedError` if signature invalid
- `UnauthorizedError` if token expired
- `UnauthorizedError` if payload malformed

### QR Code Image Generation

**File:** `backend/src/modules/tickets/ticket.controller.ts`

**Library:** `qrcode` package

```typescript
import QRCode from 'qrcode';

const signedToken = this.qrService.generateSignedTicketToken(ticket.code);

const qrCodeDataUrl = await QRCode.toDataURL(signedToken, {
  errorCorrectionLevel: 'M',  // Medium error correction
  type: 'image/png',
  width: 300,                  // 300x300 pixels
  margin: 1,                   // Minimal margin
});
```

**Output format:**
```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
```

**Properties:**
- Base64-encoded PNG image
- Can be embedded directly in `<img>` tag
- Medium error correction (25% recovery)
- 300x300px size (optimal for phones)

---

## 👛 Part 5: User Wallet

### Wallet Endpoint

**Endpoint:** `GET /api/v1/tickets/my-tickets`

**Authentication:** Required

**File:** `backend/src/modules/tickets/ticket.controller.ts`

#### Get User Tickets

```typescript
getUserTickets(req: Request, res: Response)
```

**Query:**
```typescript
await Ticket.find({ userId })
  .populate('eventId', 'title date location coverImageUrl')
  .populate('orderId', 'total createdAt')
  .sort({ createdAt: -1 });
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "6a00df362608c2a32d66923b",
      "code": "xK3mN9pQrLz8vF2jW7yH4s",
      "orderId": "6a00df362608c2a32d66923a",
      "eventId": {
        "id": "...",
        "title": "Tech Conference 2026",
        "date": "2026-06-15T18:00:00.000Z",
        "location": "Convention Center",
        "coverImageUrl": "/uploads/events/..."
      },
      "status": "valid",
      "qrCode": "data:image/png;base64,iVBORw0KGgoAAAA...",
      "signedToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "createdAt": "2026-05-10T14:30:00.000Z",
      "updatedAt": "2026-05-10T14:30:00.000Z"
    }
  ]
}
```

### Frontend Wallet Page

**File:** `frontend/src/pages/TicketsPage.tsx`

**Route:** `/my-tickets` or `/tickets`

**Features:**
1. **Grouped by event**
   - Shows event title, date, location
   - Groups all tickets for same event
   - Displays valid/used count

2. **Ticket cards**
   - Shows ticket status (valid/used)
   - Displays mini QR code preview
   - Click to open full QR code modal

3. **QR Code modal**
   - Full-size QR code (400x400px)
   - Event details
   - Ticket ID and code
   - Purchase date
   - Status badge

4. **Real-time QR display**
   ```tsx
   <img src={ticket.qrCode} alt="QR Code" />
   ```
   - No client-side generation needed
   - Backend generates QR on every request
   - Always includes fresh signed JWT

---

## 🎫 Part 6: Ticket Validation API

### Validate Ticket Endpoint

**Endpoint:** `POST /api/v1/tickets/validate`

**File:** `backend/src/modules/tickets/ticket.controller.ts`

**Purpose:** Scanner/gate validation (marks ticket as USED)

#### Request

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Process

1. **Verify JWT signature and expiration**
   ```typescript
   const ticketCode = this.qrService.verifySignedTicketToken(token);
   ```

2. **Find ticket by code**
   ```typescript
   const ticket = await this.ticketService.findTicketByCode(ticketCode);
   ```

3. **Mark as used (ATOMIC)**
   ```typescript
   const usedTicket = await this.ticketService.markTicketUsed(ticketCode);
   ```

   **Atomic update:**
   ```typescript
   await Ticket.findOneAndUpdate(
     { code, status: TicketStatus.VALID },
     { $set: { status: TicketStatus.USED } },
     { new: true }
   );
   ```

   **Race condition prevention:**
   - Only updates if status is VALID
   - If already USED → update fails
   - Prevents double-entry

#### Response (Success)

```json
{
  "success": true,
  "data": {
    "success": true,
    "ticket": {
      "id": "6a00df362608c2a32d66923b",
      "code": "xK3mN9pQrLz8vF2jW7yH4s",
      "status": "used",
      "eventId": {
        "title": "Tech Conference 2026",
        "date": "2026-06-15T18:00:00.000Z",
        "location": "Convention Center"
      }
    },
    "message": "Ticket validated and marked as used"
  }
}
```

#### Error Responses

**404 Not Found:**
```json
{
  "success": false,
  "error": {
    "message": "Ticket not found",
    "code": "NOT_FOUND"
  }
}
```

**409 Conflict (Already Used):**
```json
{
  "success": false,
  "error": {
    "message": "Ticket has already been used",
    "code": "CONFLICT"
  }
}
```

**401 Unauthorized (Expired Token):**
```json
{
  "success": false,
  "error": {
    "message": "QR token has expired",
    "code": "UNAUTHORIZED"
  }
}
```

### Check Status Endpoint

**Endpoint:** `POST /api/v1/tickets/check-status`

**Purpose:** Pre-validation check (does NOT mark as used)

**Use case:** Check if ticket is valid before scanning

#### Request/Response

Same format as `/validate` but **does not modify** ticket status.

---

## 📚 Part 7: Swagger Documentation

### Documented Endpoints

All endpoints have complete Swagger documentation:

#### Payments
- `POST /api/v1/payments/preference` - Create payment preference
- `POST /api/v1/payments/webhook` - MercadoPago webhook
- `GET /api/v1/payments/order/:orderId` - Get payment by order
- `GET /api/v1/payments/:id` - Get payment by ID

#### Tickets
- `GET /api/v1/tickets/my-tickets` - User wallet
- `GET /api/v1/tickets/:id` - Single ticket with QR
- `POST /api/v1/tickets/validate` - Validate and mark used
- `POST /api/v1/tickets/check-status` - Check without marking

**Access documentation:**
```
http://localhost:5001/api/docs
```

---

## 🚀 Part 8: Running the Application

### Backend

```bash
cd backend

# Install dependencies (including qrcode)
npm install

# Set environment variables
cp .env.example .env

# Required variables:
# MERCADOPAGO_ACCESS_TOKEN=your_access_token
# MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret
# JWT_SECRET=your_jwt_secret
# MONGODB_URI=mongodb://localhost:27017/ticketing
# BACKEND_URL=http://localhost:5001
# FRONTEND_URL=http://localhost:3000

# Start development server
npm run dev

# Backend runs on http://localhost:5001
# Swagger docs at http://localhost:5001/api/docs
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend runs on http://localhost:3000
```

### Test the Flow

1. **Register/Login** → `http://localhost:3000/login`

2. **Browse events** → `http://localhost:3000/events`

3. **Select event** → `http://localhost:3000/events/:id`

4. **Add tickets and checkout**

5. **Create payment preference** (redirects to MercadoPago)

6. **Complete payment** on MercadoPago checkout

7. **MercadoPago webhook** triggers automatic ticket issuance

8. **View tickets** → `http://localhost:3000/my-tickets`

9. **Scan QR code** using validation endpoint:
   ```bash
   curl -X POST http://localhost:5001/api/v1/tickets/validate \
     -H "Content-Type: application/json" \
     -d '{"token": "eyJhbGciOiJI..."}'
   ```

---

## 📊 Architecture Summary

### Payment Lifecycle

```
Order Created (PENDING)
    ↓
Payment Created (PENDING)
    ↓
MercadoPago Preference Created
    ↓
User Pays on MercadoPago
    ↓
Webhook Received
    ↓
Payment Verified (APPROVED)
    ↓
Order Updated (PAID)
    ↓
Tickets Issued Automatically
    ↓
User Views in Wallet
```

### Ticket Issuance Flow

```
Payment Approved
    ↓
Calculate Total Quantity
    ↓
Generate Unique Codes
    ↓
Create Ticket Documents
    ↓
Link to Order/Event/User
    ↓
Set Status: VALID
```

### QR Validation Flow

```
User Opens Wallet
    ↓
Backend Generates Signed JWT
    ↓
Backend Generates QR Image
    ↓
User Shows QR at Gate
    ↓
Scanner Reads QR
    ↓
Extract JWT Token
    ↓
POST /tickets/validate
    ↓
Verify JWT Signature
    ↓
Find Ticket by Code
    ↓
Atomic Update: VALID → USED
    ↓
Grant Entry
```

---

## ✅ Implementation Checklist

### Backend
- ✅ Order status: PENDING, PAID, CANCELLED, REFUNDED
- ✅ Payment status: PENDING, APPROVED, REJECTED, REFUNDED
- ✅ Ticket status: VALID, USED
- ✅ MercadoPago webhook processing
- ✅ Webhook signature verification
- ✅ Idempotent webhook handling
- ✅ Automatic ticket issuance
- ✅ Unique ticket code generation
- ✅ QR code generation (qrcode library)
- ✅ Signed JWT tokens for validation
- ✅ Atomic ticket validation
- ✅ Race condition prevention
- ✅ User wallet endpoint
- ✅ Ticket validation endpoint
- ✅ Complete Swagger documentation

### Frontend
- ✅ Tickets API integration
- ✅ Wallet page (/my-tickets)
- ✅ Real QR code display
- ✅ Ticket grouping by event
- ✅ Status badges (valid/used)
- ✅ Full-size QR modal
- ✅ Event details display

---

## 🔒 Security Features

1. **Webhook Signature Verification**
   - HMAC-SHA256 with secret
   - Timing-safe comparison

2. **Payment Amount Validation**
   - Compares expected vs. actual amount
   - Rejects mismatches (fraud detection)

3. **JWT Token Security**
   - Signed with secret key
   - 5-minute expiration
   - Prevents screenshot attacks

4. **Idempotent Operations**
   - Webhook processing
   - Ticket issuance
   - Prevents duplicates

5. **Atomic Ticket Validation**
   - Race condition prevention
   - Double-entry prevention

6. **Cryptographic Ticket Codes**
   - 144-bit entropy
   - URL-safe encoding
   - Collision-resistant

---

**Status:** ✅ **COMPLETE & PRODUCTION-READY**

All parts implemented, tested, and documented!
