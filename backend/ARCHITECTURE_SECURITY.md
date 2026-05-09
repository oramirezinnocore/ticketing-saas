# Security Architecture Overview

## Complete Secure Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY (SECURED)                          │
└─────────────────────────────────────────────────────────────────────────┘

1. USER AUTHENTICATION
   │
   ├─ POST /api/v1/auth/register
   │  └─ Password hashed (bcrypt)
   │  └─ JWT generated with role
   │
   ├─ POST /api/v1/auth/login
   │  └─ Password verified
   │  └─ JWT returned
   │
   └─ Request Headers:
      Authorization: Bearer <JWT_TOKEN>

────────────────────────────────────────────────────────────────────────────

2. CREATE ORDER (Protected Route)
   │
   ├─ authenticate middleware
   │  └─ Verify JWT signature
   │  └─ Attach user to request
   │
   ├─ authorize('user', 'organizer', 'admin')
   │  └─ Check user role
   │
   ├─ POST /api/v1/orders
   │  └─ Atomic inventory decrement
   │  └─ Order status: PENDING
   │  └─ expiresAt: +15 minutes ⏰
   │
   └─ SECURITY:
      ✓ JWT required
      ✓ Role verified
      ✓ Inventory locked transactionally
      ✓ Order expires automatically

────────────────────────────────────────────────────────────────────────────

3. CREATE PAYMENT PREFERENCE
   │
   ├─ POST /api/v1/payments/preference
   │  └─ Validate order exists
   │  └─ Check order is PENDING
   │  └─ Prevent duplicate payments
   │  └─ Call MercadoPago API
   │  └─ Store payment record (PENDING)
   │
   └─ SECURITY:
      ✓ Payment record created BEFORE webhook
      ✓ One payment per order
      ✓ Structured logging

────────────────────────────────────────────────────────────────────────────

4. USER COMPLETES PAYMENT (MercadoPago)
   │
   └─ External payment processing
      └─ Credit card, bank transfer, etc.

────────────────────────────────────────────────────────────────────────────

5. WEBHOOK RECEIVED (CRITICAL SECURITY LAYER)
   │
   ├─ POST /api/v1/payments/webhook
   │  │
   │  ├─ STEP 1: Verify Signature ⚠️ MANDATORY
   │  │  └─ Check x-signature header exists
   │  │  └─ HMAC-SHA256 verification
   │  │  └─ Timing-safe comparison
   │  │  └─ REJECT if invalid
   │  │
   │  ├─ STEP 2: Fetch Payment from MercadoPago
   │  │  └─ GET /v1/payments/{id}
   │  │  └─ Verify external_reference (orderId)
   │  │
   │  ├─ STEP 3: Idempotency Check
   │  │  └─ Check webhookProcessed flag
   │  │  └─ Skip if already processed
   │  │
   │  ├─ STEP 4: Transaction Start
   │  │  │
   │  │  ├─ Find payment record (NO UPSERT)
   │  │  │  └─ MUST exist from preference
   │  │  │  └─ Throw error if missing
   │  │  │
   │  │  ├─ AMOUNT VALIDATION ⚠️ ANTI-FRAUD
   │  │  │  └─ Compare transaction_amount vs order.total
   │  │  │  └─ Tolerance: 0.01 (floating point)
   │  │  │  └─ If mismatch:
   │  │  │     ├─ Mark payment REJECTED
   │  │  │     ├─ Log fraud attempt
   │  │  │     └─ Throw ConflictError
   │  │  │
   │  │  ├─ Update payment status
   │  │  │  └─ Mark webhookProcessed: true
   │  │  │
   │  │  ├─ Update order status → PAID
   │  │  │
   │  │  └─ Generate tickets (automatic)
   │  │     └─ Cryptographically secure codes
   │  │     └─ One ticket per quantity
   │  │     └─ Status: VALID
   │  │
   │  └─ STEP 5: Transaction Commit
   │     └─ All succeed or all rollback
   │
   └─ SECURITY:
      ✓ Signature verification (mandatory)
      ✓ Amount validation (anti-fraud)
      ✓ No upsert (prevents phantom payments)
      ✓ Idempotent processing
      ✓ Transactional safety
      ✓ Structured fraud logging

────────────────────────────────────────────────────────────────────────────

6. TICKET GENERATION
   │
   ├─ Triggered automatically by payment approval
   │
   ├─ Generate unique codes
   │  └─ crypto.randomBytes(18).toString('base64url')
   │  └─ Collision detection
   │
   ├─ Create ticket documents
   │  └─ code: unique cryptographic code
   │  └─ status: VALID
   │  └─ orderId, eventId, userId
   │
   └─ SECURITY:
      ✓ Cryptographically secure codes
      ✓ Transactional creation
      ✓ Idempotent (safe to retry)

────────────────────────────────────────────────────────────────────────────

7. QR CODE GENERATION (Signed Tokens)
   │
   ├─ User requests ticket QR
   │
   ├─ Generate signed JWT token
   │  └─ Payload: { ticketCode: "abc..." }
   │  └─ Expiry: 5 minutes (configurable)
   │  └─ Signed with JWT_SECRET
   │
   ├─ Return signed token (NOT raw code)
   │  └─ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   │
   └─ SECURITY:
      ✓ Raw code never exposed
      ✓ Tamper protection (signature)
      ✓ Time-bound validity
      ✓ Replay attack mitigation

────────────────────────────────────────────────────────────────────────────

8. TICKET VALIDATION (Scanner Flow)
   │
   ├─ Scanner scans QR code
   │
   ├─ STEP 1: Verify Token Signature
   │  └─ jwt.verify(token, JWT_SECRET)
   │  └─ Check expiration
   │  └─ Extract ticketCode
   │
   ├─ STEP 2: Atomic Ticket Update ⚠️ CONCURRENCY-SAFE
   │  └─ findOneAndUpdate({ code, status: VALID }, { status: USED })
   │  └─ Single atomic operation
   │  └─ Prevents race conditions
   │  └─ Only ONE scanner can mark as USED
   │
   └─ SECURITY:
      ✓ Signature verified before DB access
      ✓ Atomic update (no races)
      ✓ Prevents double-scanning
      ✓ Database-level concurrency control
      ✓ Structured logging of all scans

────────────────────────────────────────────────────────────────────────────

9. ORDER EXPIRATION (Background Process)
   │
   ├─ Cron job runs every 5 minutes
   │  └─ scripts/cleanupExpiredOrders.ts
   │
   ├─ Find expired pending orders
   │  └─ status: PENDING
   │  └─ expiresAt <= now
   │
   ├─ For each order (transactional):
   │  │
   │  ├─ Check order still PENDING (race condition check)
   │  │
   │  ├─ Update order status → CANCELLED
   │  │
   │  └─ Restore inventory atomically
   │     └─ Event.updateOne($inc: quantityAvailable)
   │     └─ Uses arrayFilters for specific ticket types
   │
   └─ SECURITY:
      ✓ Prevents inventory lockup
      ✓ Transactional restoration
      ✓ Idempotent (safe to run multiple times)
      ✓ Race condition handled

════════════════════════════════════════════════════════════════════════════

SECURITY LAYERS

┌────────────────────────────────────────────────────────────────────────┐
│ LAYER 1: AUTHENTICATION & AUTHORIZATION                               │
├────────────────────────────────────────────────────────────────────────┤
│ • JWT-based authentication                                             │
│ • Role-based access control (user, organizer, admin)                   │
│ • Protected routes with middleware                                     │
│ • Type-safe user context                                               │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ LAYER 2: WEBHOOK SECURITY                                             │
├────────────────────────────────────────────────────────────────────────┤
│ • Mandatory signature verification                                     │
│ • HMAC-SHA256 cryptographic verification                               │
│ • Timing-safe comparison (prevents timing attacks)                     │
│ • Reject unsigned webhooks                                             │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ LAYER 3: FRAUD PREVENTION                                             │
├────────────────────────────────────────────────────────────────────────┤
│ • Payment amount validation                                            │
│ • Compare MercadoPago amount vs order total                            │
│ • Log fraud attempts with details                                      │
│ • Reject mismatched payments                                           │
│ • No ticket generation on fraud                                        │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ LAYER 4: CONCURRENCY CONTROL                                          │
├────────────────────────────────────────────────────────────────────────┤
│ • Atomic ticket validation (prevents double-scan)                      │
│ • Atomic inventory decrements (prevents overselling)                   │
│ • MongoDB transactions for multi-step operations                       │
│ • Idempotent webhook processing                                        │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ LAYER 5: TAMPER PROTECTION                                            │
├────────────────────────────────────────────────────────────────────────┤
│ • Signed QR tokens (JWT)                                               │
│ • Time-bound token validity                                            │
│ • Cryptographically secure ticket codes                                │
│ • No raw codes exposed                                                 │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ LAYER 6: INVENTORY PROTECTION                                         │
├────────────────────────────────────────────────────────────────────────┤
│ • 15-minute order expiration                                           │
│ • Automatic inventory recovery                                         │
│ • Transactional restoration                                            │
│ • Prevents inventory hoarding                                          │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ LAYER 7: OBSERVABILITY                                                │
├────────────────────────────────────────────────────────────────────────┤
│ • Structured logging (Pino)                                            │
│ • Request logging                                                      │
│ • Fraud attempt logging                                                │
│ • Ticket validation logging                                            │
│ • Webhook event logging                                                │
│ • Production-ready JSON logs                                           │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ LAYER 8: FAIL-SAFE DEFAULTS                                           │
├────────────────────────────────────────────────────────────────────────┤
│ • Environment validation on startup                                    │
│ • Fail-fast on missing critical vars                                   │
│ • Strong JWT_SECRET enforcement (32+ chars)                            │
│ • Clear error messages                                                 │
└────────────────────────────────────────────────────────────────────────┘

════════════════════════════════════════════════════════════════════════════

TRANSACTION FLOW DIAGRAM

┌──────────────┐
│   Request    │
└──────┬───────┘
       │
       ├─────► [Authenticate] ◄── JWT Verification
       │              │
       │              ├─ Valid → Attach user to req
       │              └─ Invalid → 401 Unauthorized
       │
       ├─────► [Authorize] ◄── Role Check
       │              │
       │              ├─ Allowed → Continue
       │              └─ Denied → 403 Forbidden
       │
       ├─────► [Request Logger] ◄── Log request
       │
       ├─────► [Controller] ◄── Business logic
       │              │
       │              ├─ Success → Send response
       │              └─ Error → Throw AppError
       │
       └─────► [Error Handler] ◄── Catch all errors
                      │
                      ├─ Operational → Return error response
                      ├─ Non-operational → Log + 500
                      └─ Log structured error

════════════════════════════════════════════════════════════════════════════

DATABASE OPERATIONS

All critical operations use MongoDB transactions:

┌─────────────────────────────────────────────────────────────────────┐
│ session.withTransaction(async () => {                               │
│   // All operations share same session                              │
│   await Order.updateOne({ ... }, { session });                      │
│   await Payment.updateOne({ ... }, { session });                    │
│   await Ticket.insertMany([...], { session });                      │
│   // All succeed or all rollback                                    │
│ });                                                                  │
└─────────────────────────────────────────────────────────────────────┘

Atomic updates for concurrency:

┌─────────────────────────────────────────────────────────────────────┐
│ // Prevents race conditions                                         │
│ await Model.findOneAndUpdate(                                       │
│   { _id, status: 'VALID' },  // Query with status check            │
│   { $set: { status: 'USED' } },  // Update                         │
│   { new: true }                                                     │
│ );                                                                  │
│ // Only ONE concurrent request succeeds                             │
└─────────────────────────────────────────────────────────────────────┘

════════════════════════════════════════════════════════════════════════════

MONITORING POINTS

┌─────────────────────┬──────────────────────────────────────────────┐
│ Metric              │ Alert Condition                              │
├─────────────────────┼──────────────────────────────────────────────┤
│ Webhook Signature   │ > 5 failures in 10 minutes                   │
│ Payment Mismatch    │ Any occurrence (potential fraud)             │
│ Double Scan         │ > 10 attempts per hour                       │
│ QR Token Expiry     │ > 20% of validations expired                 │
│ Order Expiration    │ > 100 expired orders in cleanup              │
│ Response Time       │ > 2 seconds for any endpoint                 │
│ Error Rate          │ > 5% of requests                             │
└─────────────────────┴──────────────────────────────────────────────┘

════════════════════════════════════════════════════════════════════════════
