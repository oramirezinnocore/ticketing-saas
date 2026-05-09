# Checkout Flow Diagram

## Visual Flow Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TICKETING SAAS FLOW                             │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Browser    │
│  /events     │  1. User browses events
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Event Detail │  2. User selects tickets
│  /events/:id │     - Choose quantities
└──────┬───────┘     - Real-time price calc
       │
       │ Click "Buy Tickets"
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Order Creation                                │
│                                                                  │
│  Frontend sends:                                                │
│  POST /api/v1/orders                                           │
│  {                                                              │
│    eventId: "...",                                             │
│    tickets: [                                                   │
│      { ticketType: "VIP", quantity: 2 }                        │
│    ]                                                            │
│  }                                                              │
│                                                                  │
│  Backend:                                                       │
│  ✓ Validates inventory                                         │
│  ✓ Calculates total (server-side)                             │
│  ✓ Locks inventory                                             │
│  ✓ Sets expiration (15 min)                                   │
│  ✓ Returns order                                                │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Checkout   │  3. Review order
                    │ /checkout/:id │     - Order summary
                    └──────┬───────┘     - Expiration timer
                           │
                           │ Click "Proceed to Payment"
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│              Payment Preference Creation                         │
│                                                                  │
│  Frontend sends:                                                │
│  POST /api/v1/payments/preference                              │
│  {                                                              │
│    orderId: "...",                                             │
│    description: "Event - Tickets",                             │
│    buyerEmail: "user@example.com"                              │
│  }                                                              │
│                                                                  │
│  Backend:                                                       │
│  ✓ Creates MercadoPago preference                             │
│  ✓ Configures return URLs                                     │
│  ✓ Creates payment record (status: pending)                   │
│  ✓ Returns initPoint URL                                      │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ window.location.href = initPoint
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │      MercadoPago Checkout            │
        │   (External Payment Gateway)          │
        │                                       │
        │  User completes payment:              │
        │  - Enter card details                 │
        │  - Confirm payment                    │
        └──────────┬───────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
┌─────────┐  ┌─────────┐  ┌─────────┐
│ Success │  │ Pending │  │ Failure │
└────┬────┘  └────┬────┘  └────┬────┘
     │            │            │
     │            │            │
     └────────────┴────────────┘
                  │
                  │ MercadoPago redirects user
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
    /payment/success   /payment/pending   /payment/failure
         │                 │                     │
         │                 │                     │
         └─────────────────┴─────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    Webhook Processing                            │
│                   (Async, Server-Side)                          │
│                                                                  │
│  MercadoPago → Backend                                          │
│  POST /api/v1/payments/webhook                                 │
│                                                                  │
│  Backend:                                                       │
│  1. Verify signature (HMAC-SHA256)                            │
│  2. Validate payment amount                                    │
│  3. Update payment status                                      │
│  4. If APPROVED:                                               │
│     - Update order status → PAID                               │
│     - Generate tickets                                         │
│     - Send confirmation email                                  │
│  5. If REJECTED:                                               │
│     - Update payment status                                    │
│     - Keep order as PENDING                                    │
│     - Release inventory after expiration                       │
└──────────────────────────────────────────────────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Tickets    │  4. User views tickets
                    │  /tickets    │     - QR codes
                    └──────────────┘     - Event details
                                         - Ready to use
```

## State Transitions

### Order Status Flow

```
    CREATE ORDER
         │
         ▼
    ┌─────────┐
    │ PENDING │◄──────────┐
    └────┬────┘           │
         │                │
    ┌────┴────┐          │
    │         │          │
    ▼         ▼          │
PAYMENT    EXPIRED   PAYMENT
APPROVED   (15min)   FAILED
    │                    │
    ▼                    │
┌────────┐               │
│  PAID  │               │
└────────┘               │
    │                    │
    ▼                    │
GENERATE                 │
TICKETS         ┌────────┴─────────┐
                │ INVENTORY UNLOCK │
                └──────────────────┘
```

### Payment Status Flow

```
    CREATE PREFERENCE
         │
         ▼
    ┌─────────┐
    │ PENDING │
    └────┬────┘
         │
    ┌────┴──────────────┐
    │                   │
    ▼                   ▼
┌──────────┐      ┌──────────┐
│ APPROVED │      │ REJECTED │
└──────────┘      └──────────┘
    │                   │
    ▼                   ▼
UPDATE ORDER      KEEP ORDER
TO PAID          AS PENDING
    │                   │
    ▼                   ▼
GENERATE          RETRY ALLOWED
TICKETS          (until expiry)
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────┐        │
│  │              Page Components                    │        │
│  │  ┌──────────────┐  ┌──────────────┐           │        │
│  │  │ EventsPage   │  │EventDetailPg │           │        │
│  │  └──────────────┘  └──────────────┘           │        │
│  │  ┌──────────────┐  ┌──────────────┐           │        │
│  │  │ CheckoutPage │  │PaymentSuccess│           │        │
│  │  └──────────────┘  └──────────────┘           │        │
│  │  ┌──────────────┐  ┌──────────────┐           │        │
│  │  │ TicketsPage  │  │PaymentPending│           │        │
│  │  └──────────────┘  └──────────────┘           │        │
│  └────────────────────────────────────────────────┘        │
│                          │                                  │
│                          ▼                                  │
│  ┌────────────────────────────────────────────────┐        │
│  │           React Query (Server State)           │        │
│  │  - events query                                │        │
│  │  - order query                                 │        │
│  │  - payment query                               │        │
│  │  - tickets query                               │        │
│  │  - mutations (create order, payment)           │        │
│  └────────────────────────────────────────────────┘        │
│                          │                                  │
│                          ▼                                  │
│  ┌────────────────────────────────────────────────┐        │
│  │          Zustand (Client State)                │        │
│  │  ┌──────────────┐  ┌──────────────┐           │        │
│  │  │  authStore   │  │checkoutStore │           │        │
│  │  │  - user      │  │ - currentOrder│          │        │
│  │  │  - token     │  │ - pendingPmnt│           │        │
│  │  │  - isAuth    │  └──────────────┘           │        │
│  │  └──────────────┘                              │        │
│  └────────────────────────────────────────────────┘        │
│                          │                                  │
│                          ▼                                  │
│  ┌────────────────────────────────────────────────┐        │
│  │              API Layer                         │        │
│  │  - Axios instance                              │        │
│  │  - JWT interceptor                             │        │
│  │  - Auto-logout on 401                          │        │
│  │  - Error handling                              │        │
│  └────────────────────────────────────────────────┘        │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           │ HTTP/JSON
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                          ▼                                   │
│  ┌────────────────────────────────────────────────┐        │
│  │          Express Middleware Stack              │        │
│  │  1. CORS                                       │        │
│  │  2. Helmet (security headers)                  │        │
│  │  3. Rate limiter                               │        │
│  │  4. Request logger                             │        │
│  │  5. Body parser                                │        │
│  └────────────────────────────────────────────────┘        │
│                          │                                  │
│                          ▼                                  │
│  ┌────────────────────────────────────────────────┐        │
│  │             Route Handlers                     │        │
│  │  - Auth routes                                 │        │
│  │  - Event routes                                │        │
│  │  - Order routes                                │        │
│  │  - Payment routes                              │        │
│  │  - Ticket routes                               │        │
│  └────────────────────────────────────────────────┘        │
│                          │                                  │
│                          ▼                                  │
│  ┌────────────────────────────────────────────────┐        │
│  │             Services Layer                     │        │
│  │  - Business logic                              │        │
│  │  - Validation                                  │        │
│  │  - External API calls                          │        │
│  └────────────────────────────────────────────────┘        │
│                          │                                  │
│                          ▼                                  │
│  ┌────────────────────────────────────────────────┐        │
│  │          Repository Layer                      │        │
│  │  - Database operations                         │        │
│  │  - Mongoose models                             │        │
│  └────────────────────────────────────────────────┘        │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   MongoDB    │
                    └──────────────┘
```

## Data Flow Example

### Complete Purchase Flow

```
USER ACTION                 FRONTEND                  BACKEND                 EXTERNAL

[Browse Events]
     │
     ├─────────►  GET /events ──────────────►  Query DB
     │                                              │
     │                                              ▼
     │            ◄────────── Events[] ─────  Return events
     │
[Select Tickets]
     │
     │         Update local state
     │         Calculate total (UI only)
     │
[Click Checkout]
     │
     ├─────────►  POST /orders ─────────────►  Validate inventory
     │            {eventId, tickets}              │
     │                                             ├─ Lock inventory
     │                                             ├─ Calculate total (server)
     │                                             ├─ Set expiration
     │                                             ▼
     │            ◄─────── Order ────────────  Save to DB
     │
     │         Navigate to /checkout/:id
     │
[Review Order]
     │
     │         Show order details
     │         Start countdown timer
     │
[Proceed to Payment]
     │
     ├─────────►  POST /payments/preference ►  Create MP preference
     │            {orderId, email}                    │
     │                                                 │
     │                                                 ├──────────►  MercadoPago
     │                                                 │            Create preference
     │                                                 │                 │
     │                                                 │                 ▼
     │                                                 │             Return initPoint
     │                                                 ◄──────────────────┘
     │                                                 │
     │                                                 ├─ Save payment
     │                                                 ▼
     │            ◄──── {initPoint, payment} ────  Return
     │
     │         Redirect: window.location.href = initPoint
     │
[MercadoPago Page] ────────────────────────────────────►  MercadoPago
     │                                                    Process payment
     │                                                          │
     │                                                          ├─ Card validation
     │                                                          ├─ Fraud check
     │                                                          ├─ Payment processing
     │                                                          │
     │         ◄──────────── Redirect ──────────────────────────┘
     │         (to success/pending/failure URL)
     │
     │         User sees result page
     │         Poll for payment status
     │
     │                                      Async webhook:
     │                                              │
     │                                      POST /payments/webhook ──►  MercadoPago
     │                                              │                  Send notification
     │                                              ◄────────────────────────┘
     │                                              │
     │                                      ├─ Verify signature
     │                                      ├─ Validate amount
     │                                      ├─ Update payment
     │                                      ├─ Update order → PAID
     │                                      ├─ Generate tickets
     │                                      └─ Send email
     │
[View Tickets]
     │
     ├─────────►  GET /tickets/user/me ───►  Query tickets
     │                                              │
     │                                              ▼
     │            ◄─────── Tickets[] ────────  Return tickets
     │
     │         Display with QR codes
```

## Security Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                          │
└─────────────────────────────────────────────────────────────┘

Request ─►  1. CORS Check
               │
               ├─ Origin allowed?
               │  - Yes → Continue
               │  - No  → Block (403)
               │
               ▼
            2. Rate Limiter
               │
               ├─ Within rate limit?
               │  - Yes → Continue
               │  - No  → Block (429)
               │
               ▼
            3. JWT Verification (Protected Routes)
               │
               ├─ Token present?
               │  - No  → Reject (401)
               │  - Yes → Verify signature
               │           │
               │           ├─ Valid?
               │           │  - Yes → Extract user
               │           │  - No  → Reject (401)
               │           │
               │           └─ Expired?
               │              - Yes → Reject (401)
               │              - No  → Continue
               │
               ▼
            4. Role Authorization
               │
               ├─ Has required role?
               │  - Yes → Continue
               │  - No  → Reject (403)
               │
               ▼
            5. Business Logic Validation
               │
               ├─ Inventory check
               ├─ Amount validation
               ├─ Order ownership
               │
               ▼
            6. Process Request
```

## Webhook Security

```
MercadoPago Webhook
         │
         ▼
    ┌────────────────────────┐
    │ Extract x-signature    │
    └───────────┬────────────┘
                │
                ▼
    ┌────────────────────────┐
    │ Extract x-request-id   │
    └───────────┬────────────┘
                │
                ▼
    ┌────────────────────────┐
    │ Compute HMAC-SHA256    │
    │ using webhook secret   │
    └───────────┬────────────┘
                │
                ▼
    ┌────────────────────────┐
    │ Compare signatures     │
    └───────────┬────────────┘
                │
         ┌──────┴──────┐
         │             │
         ▼             ▼
    ┌─────────┐   ┌─────────┐
    │  Match  │   │ Mismatch│
    └────┬────┘   └────┬────┘
         │             │
         ▼             ▼
    Process       Reject (403)
    Webhook      + Log attempt
```

## Error Handling Flow

```
Request Processing
         │
         ├─────► Try Block
         │          │
         │          ├─ Business Logic
         │          ├─ DB Operations
         │          ├─ External API
         │          │
         │          ▼
         │       Success?
         │          │
         │    ┌─────┴─────┐
         │    │           │
         │    ▼           ▼
         │   YES         NO
         │    │           │
         │    │           └───► Catch Block
         │    │                    │
         │    │              ┌─────┴────────────────┐
         │    │              │                      │
         │    │              ▼                      ▼
         │    │       Known Error          Unknown Error
         │    │       (BadRequest,         (Unexpected)
         │    │        NotFound,                 │
         │    │        Conflict)                 │
         │    │              │                    │
         │    │              └────────┬───────────┘
         │    │                       │
         │    ▼                       ▼
         │  Return              Error Handler
         │  Success             Middleware
         │  Response                  │
         │    │                       ├─ Log error
         │    │                       ├─ Format response
         │    │                       ├─ Hide internals
         │    │                       │  (in production)
         │    │                       │
         └────┴───────────────────────┴───► Client Response
```

## Monitoring & Logging

```
Request ─►  Request Logger
               │
               ├─ Log: method, path, IP, timestamp
               │
               ▼
            Process Request
               │
         ┌─────┴──────┐
         │            │
         ▼            ▼
      Success      Error
         │            │
         ├─ Log OK   ├─ Log Error
         │           ├─ Stack trace
         │           ├─ Context
         │           └─ Alert (critical)
         │
         └────────────┴──────► Structured Logs
                                    │
                                    ├─ Local: Pretty print
                                    └─ Production: JSON
                                          │
                                          └──► Log aggregation
                                               (e.g., CloudWatch,
                                                Datadog, Sentry)
```
