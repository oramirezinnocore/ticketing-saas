# MercadoPago Preference Creation Fix - Complete

## 🔴 ISSUE IDENTIFIED

**Error:** "auto_return invalid. back_url.success must be defined"

**Root Causes:**
1. ❌ BACKEND_URL in .env was `http://localhost:5000` but PORT was `5001` (mismatch)
2. ❌ FRONTEND_URL in .env was `http://localhost:3000` but Vite runs on `5173`
3. ❌ BACKEND_URL and FRONTEND_URL not validated as critical environment variables
4. ❌ Payment service used fallback logic instead of validated env config
5. ❌ Poor error logging for MercadoPago API failures

---

## ✅ FIXES APPLIED

### Fix #1: Corrected Environment Variables

**File:** `backend/.env`

**Before:**
```bash
BACKEND_URL=http://localhost:5000  # ❌ Wrong port
FRONTEND_URL=http://localhost:3000  # ❌ Wrong port (React default, not Vite)
```

**After:**
```bash
BACKEND_URL=http://localhost:5001  # ✅ Matches PORT=5001
FRONTEND_URL=http://localhost:5173  # ✅ Matches Vite default
```

### Fix #2: Enhanced Environment Configuration

**File:** `backend/src/config/env.ts`

**Changes:**

#### 2a. Added URL Variables to Interface
```typescript
interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CORS_ORIGIN: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  BACKEND_URL: string;              // ✅ ADDED
  FRONTEND_URL: string;             // ✅ ADDED
  MERCADOPAGO_ACCESS_TOKEN: string; // ✅ ADDED
  MERCADOPAGO_WEBHOOK_SECRET: string; // ✅ ADDED
}
```

#### 2b. Made URLs Critical (Validated at Startup)
```typescript
const validateCriticalEnvVars = (): void => {
  const critical = [
    'JWT_SECRET',
    'MONGODB_URI',
    'MERCADOPAGO_ACCESS_TOKEN',
    'MERCADOPAGO_WEBHOOK_SECRET',
    'BACKEND_URL',   // ✅ NOW REQUIRED
    'FRONTEND_URL',  // ✅ NOW REQUIRED
  ];

  // Validate URL formats
  const urlVars = ['BACKEND_URL', 'FRONTEND_URL'];
  for (const key of urlVars) {
    const value = process.env[key];
    if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
      throw new Error(`CRITICAL: ${key} must be a valid URL starting with http:// or https://`);
    }
  }
};
```

#### 2c. Export Configuration
```typescript
export const env: EnvConfig = {
  NODE_ENV: getEnvVariable('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVariable('PORT', '5001'), 10),
  MONGODB_URI: getEnvVariable('MONGODB_URI'),
  JWT_SECRET: getEnvVariable('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnvVariable('JWT_EXPIRES_IN', '7d'),
  CORS_ORIGIN: getEnvVariable('CORS_ORIGIN', 'http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: parseInt(getEnvVariable('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(getEnvVariable('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
  BACKEND_URL: getEnvVariable('BACKEND_URL'),              // ✅ ADDED
  FRONTEND_URL: getEnvVariable('FRONTEND_URL'),            // ✅ ADDED
  MERCADOPAGO_ACCESS_TOKEN: getEnvVariable('MERCADOPAGO_ACCESS_TOKEN'), // ✅ ADDED
  MERCADOPAGO_WEBHOOK_SECRET: getEnvVariable('MERCADOPAGO_WEBHOOK_SECRET'), // ✅ ADDED
};
```

### Fix #3: Improved Payment Service

**File:** `backend/src/modules/payments/payment.service.ts`

#### 3a. Use Typed Environment Configuration
```typescript
// ❌ BEFORE: Used process.env with fallbacks
private getMercadoPagoAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN is not configured');
  }
  return token;
}

// ✅ AFTER: Use validated env config
private getMercadoPagoAccessToken(): string {
  return env.MERCADOPAGO_ACCESS_TOKEN;
}
```

#### 3b. Enhanced MercadoPago API Error Logging
```typescript
private async callMercadoPagoAPI<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: unknown
): Promise<T> {
  // ... setup code ...

  logger.debug({ url, method, hasBody: !!body }, 'Calling MercadoPago API');

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetail;
      try {
        errorDetail = JSON.parse(errorText);
      } catch {
        errorDetail = errorText;
      }

      logger.error(
        {
          url,
          method,
          status: response.status,
          statusText: response.statusText,
          error: errorDetail,
          requestBody: body, // ✅ Log request for debugging
        },
        'MercadoPago API error'
      );

      throw new Error(
        `MercadoPago API error (${response.status}): ${
          typeof errorDetail === 'object'
            ? JSON.stringify(errorDetail)
            : errorDetail
        }`
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    logger.error(
      {
        url,
        method,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'MercadoPago API call failed'
    );
    throw error;
  }
}
```

#### 3c. Use Typed URLs for Preference Creation
```typescript
// ❌ BEFORE: Used process.env with fallbacks
const baseUrl = process.env.BACKEND_URL || `http://localhost:${env.PORT}`;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

// ✅ AFTER: Use validated env config (no fallbacks needed)
const backendUrl = env.BACKEND_URL;
const frontendUrl = env.FRONTEND_URL;

const preference: MercadoPagoPreference = {
  items: [
    {
      title: description,
      quantity: 1,
      unit_price: amount,
    },
  ],
  payer: {
    email: buyerEmail,
  },
  back_urls: {
    success: `${frontendUrl}/payment/success`,
    failure: `${frontendUrl}/payment/failure`,
    pending: `${frontendUrl}/payment/pending`,
  },
  auto_return: 'approved',
  notification_url: `${backendUrl}/api/v1/payments/webhook`,
  external_reference: orderId,
};

// ✅ ADDED: Log preference creation details
logger.info(
  {
    orderId,
    amount,
    description,
    backendUrl,
    frontendUrl,
    notificationUrl: preference.notification_url,
    backUrls: preference.back_urls,
  },
  'Creating MercadoPago preference'
);
```

---

## 📋 CORRECTED MERCADOPAGO PAYLOAD

### Complete Preference Payload

```json
{
  "items": [
    {
      "title": "Concert Tickets - 2 boletos",
      "quantity": 1,
      "unit_price": 1500.00
    }
  ],
  "payer": {
    "email": "user@example.com"
  },
  "back_urls": {
    "success": "http://localhost:5173/payment/success",
    "failure": "http://localhost:5173/payment/failure",
    "pending": "http://localhost:5173/payment/pending"
  },
  "auto_return": "approved",
  "notification_url": "http://localhost:5001/api/v1/payments/webhook",
  "external_reference": "6a00df362608c2a32d66923c"
}
```

### Field Descriptions

| Field | Value | Purpose |
|-------|-------|---------|
| `items.title` | Event description | Display in MercadoPago checkout |
| `items.quantity` | 1 | Always 1 (price is total) |
| `items.unit_price` | Order total | Amount to charge |
| `payer.email` | User email | Pre-fill in checkout |
| `back_urls.success` | Frontend URL | Redirect after approved payment |
| `back_urls.failure` | Frontend URL | Redirect after rejected payment |
| `back_urls.pending` | Frontend URL | Redirect after pending payment |
| `auto_return` | "approved" | Auto-redirect on success |
| `notification_url` | Backend URL | Webhook endpoint |
| `external_reference` | Order ID | Link payment to order |

---

## 🔄 PAYMENT REDIRECT FLOW

### Complete User Journey

```
┌────────────────────────────────────────────────────────────────┐
│                    PAYMENT REDIRECT FLOW                        │
└────────────────────────────────────────────────────────────────┘

1. USER INITIATES PURCHASE
   Location: http://localhost:5173/events/:id
   Action: Click "Comprar Boletos"
   ↓

2. FRONTEND CREATES ORDER + PAYMENT
   API Call: POST http://localhost:5001/api/v1/orders/with-payment
   Request:
   {
     "eventId": "...",
     "tickets": [...],
     "buyerEmail": "user@example.com",
     "description": "Concert - 2 boletos"
   }
   ↓

3. BACKEND CREATES MERCADOPAGO PREFERENCE
   API Call: POST https://api.mercadopago.com/checkout/preferences
   Request Payload:
   {
     "items": [{ "title": "...", "quantity": 1, "unit_price": 1500 }],
     "payer": { "email": "user@example.com" },
     "back_urls": {
       "success": "http://localhost:5173/payment/success",
       "failure": "http://localhost:5173/payment/failure",
       "pending": "http://localhost:5173/payment/pending"
     },
     "auto_return": "approved",
     "notification_url": "http://localhost:5001/api/v1/payments/webhook",
     "external_reference": "ORDER_ID"
   }
   ↓

4. BACKEND RETURNS INIT_POINT
   Response:
   {
     "success": true,
     "data": {
       "order": { ... },
       "preferenceId": "12345678-abcd-...",
       "initPoint": "https://www.mercadopago.com/checkout/v1/redirect?pref_id=..."
     }
   }
   ↓

5. FRONTEND REDIRECTS TO MERCADOPAGO
   Code: window.location.href = initPoint
   User navigated to: https://www.mercadopago.com/checkout/...
   ↓

6. USER COMPLETES PAYMENT AT MERCADOPAGO
   User enters card details
   MercadoPago processes payment
   ↓

7. MERCADOPAGO REDIRECTS USER (CALLBACK)
   Based on payment result:
   - Approved: http://localhost:5173/payment/success?payment_id=XXX&external_reference=ORDER_ID
   - Rejected: http://localhost:5173/payment/failure?payment_id=XXX&external_reference=ORDER_ID
   - Pending: http://localhost:5173/payment/pending?payment_id=XXX&external_reference=ORDER_ID
   ↓

8. MERCADOPAGO SENDS WEBHOOK (PARALLEL TO CALLBACK)
   API Call: POST http://localhost:5001/api/v1/payments/webhook
   Headers: x-signature (HMAC-SHA256)
   Body:
   {
     "action": "payment.created",
     "type": "payment",
     "data": { "id": "PAYMENT_ID" }
   }
   ↓

9. BACKEND PROCESSES WEBHOOK
   - Verify signature
   - Fetch payment details from MercadoPago API
   - Update order status (PENDING → PAID)
   - Issue tickets automatically
   - Generate QR codes
   ↓

10. USER SEES RESULT PAGE
    Location: http://localhost:5173/payment/success
    - Fetches order details
    - Shows confirmation
    - Displays payment info
    - Link to tickets
    ↓

11. USER VIEWS TICKETS
    Location: http://localhost:5173/tickets
    - Shows tickets with QR codes
    - Tickets are ready to use
```

### URL Configuration Summary

| Environment | Backend URL | Frontend URL | MercadoPago Callback | Webhook |
|-------------|-------------|--------------|---------------------|---------|
| Development | `http://localhost:5001` | `http://localhost:5173` | `http://localhost:5173/payment/*` | `http://localhost:5001/api/v1/payments/webhook` |
| Production | `https://api.yourdomain.com` | `https://yourdomain.com` | `https://yourdomain.com/payment/*` | `https://api.yourdomain.com/api/v1/payments/webhook` |

**IMPORTANT:** For local development with MercadoPago, you need to expose your localhost using:
- ngrok: `ngrok http 5001`
- localtunnel: `lt --port 5001`
- Or use MercadoPago test mode which doesn't require public webhook URL

---

## 🔧 ENVIRONMENT VARIABLES

### Required Variables

**backend/.env:**
```bash
# Server Configuration
NODE_ENV=development
PORT=5001

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/ticketing-saas?replicaSet=rs0
MONGODB_TEST_URI=mongodb://127.0.0.1:27017/ticketing-saas-test?replicaSet=rs0

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=1d

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# MercadoPago (CRITICAL)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-5601398152780570-051118-692d279cf02b5fa5e1a8f55228abdeaf-3395666470
MERCADOPAGO_WEBHOOK_SECRET=edd7e34cfae81689a72c39dad6bb116d9a595805856652704e15b66a1ac08f28

# URLs (CRITICAL - MUST BE CORRECT)
BACKEND_URL=http://localhost:5001
FRONTEND_URL=http://localhost:5173
```

### Validation at Startup

The application will **fail to start** if any critical variables are missing or invalid:

```
CRITICAL: Missing required environment variables: BACKEND_URL, FRONTEND_URL
Application cannot start without these variables. Please check your .env file.
```

```
CRITICAL: BACKEND_URL must be a valid URL starting with http:// or https://
```

---

## 🐛 TROUBLESHOOTING

### Issue 1: "auto_return invalid. back_url.success must be defined"

**Cause:** FRONTEND_URL not set or incorrect

**Fix:**
```bash
# Check .env
cat backend/.env | grep FRONTEND_URL

# Should be:
FRONTEND_URL=http://localhost:5173

# Restart backend
cd backend && npm run dev
```

### Issue 2: "CRITICAL: Missing required environment variables: BACKEND_URL, FRONTEND_URL"

**Cause:** Variables not defined in .env

**Fix:**
```bash
# Add to backend/.env
BACKEND_URL=http://localhost:5001
FRONTEND_URL=http://localhost:5173
```

### Issue 3: Webhook not receiving notifications

**Cause:** localhost not accessible from internet

**Solutions:**

**Option A: Use ngrok (Recommended for testing)**
```bash
# Install ngrok: brew install ngrok

# Expose backend
ngrok http 5001

# Update .env with ngrok URL
BACKEND_URL=https://abc123.ngrok.io

# Restart backend
```

**Option B: Use MercadoPago Test Mode**
- Test mode doesn't require webhook
- Payments are simulated
- Use test credentials from MercadoPago dashboard

**Option C: Skip webhook validation in development**
```typescript
// Only for local testing - NOT for production
if (isDevelopment() && !signature) {
  logger.warn('Webhook signature missing in development mode - allowing');
  // Process without verification
}
```

### Issue 4: MercadoPago API errors not showing details

**Solution:** Check backend logs for detailed error information

```bash
# Backend will now log:
[ERROR] MercadoPago API error {
  url: 'https://api.mercadopago.com/checkout/preferences',
  method: 'POST',
  status: 400,
  statusText: 'Bad Request',
  error: {
    message: 'auto_return invalid. back_url.success must be defined',
    error: 'bad_request',
    status: 400
  },
  requestBody: { ... } // Full request for debugging
}
```

### Issue 5: Port mismatch errors

**Symptoms:**
- Backend starts on 5001 but tries to use 5000
- CORS errors from frontend

**Fix:**
```bash
# Ensure consistency
PORT=5001
BACKEND_URL=http://localhost:5001

# Frontend should connect to
VITE_API_BASE_URL=http://localhost:5001/api/v1
```

---

## ✅ VERIFICATION STEPS

### Step 1: Verify Environment Variables

```bash
cd backend
cat .env | grep -E "(BACKEND_URL|FRONTEND_URL|MERCADOPAGO)"

# Should show:
# MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
# MERCADOPAGO_WEBHOOK_SECRET=edd7e34c...
# BACKEND_URL=http://localhost:5001
# FRONTEND_URL=http://localhost:5173
```

### Step 2: Start Backend

```bash
cd backend
npm run dev
```

**Expected Output:**
```
[INFO] Connecting to MongoDB...
[INFO] MongoDB connected successfully
[INFO] ✓ MongoDB transactions are fully supported
[INFO] Server listening on port 5001
  Environment: development
  Swagger Docs: http://localhost:5001/api-docs
```

**No errors about missing environment variables should appear.**

### Step 3: Test Order Creation

```bash
# Create test order (replace TOKEN with valid JWT)
curl -X POST http://localhost:5001/api/v1/orders/with-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{
    "eventId": "6a00df362608c2a32d66923b",
    "tickets": [
      {"ticketType": "General", "quantity": 2}
    ],
    "buyerEmail": "test@example.com",
    "description": "Test Order"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "...",
      "total": 1500.00,
      "status": "pending"
    },
    "preferenceId": "12345678-abcd-...",
    "initPoint": "https://www.mercadopago.com/checkout/v1/redirect?pref_id=..."
  }
}
```

**Check Backend Logs:**
```
[INFO] Creating MercadoPago preference {
  orderId: '...',
  amount: 1500,
  backendUrl: 'http://localhost:5001',
  frontendUrl: 'http://localhost:5173',
  notificationUrl: 'http://localhost:5001/api/v1/payments/webhook',
  backUrls: {
    success: 'http://localhost:5173/payment/success',
    failure: 'http://localhost:5173/payment/failure',
    pending: 'http://localhost:5173/payment/pending'
  }
}
[DEBUG] Calling MercadoPago API { url: '...', method: 'POST', hasBody: true }
[DEBUG] MercadoPago API response received { success: true }
[INFO] Payment preference created { orderId: '...', preferenceId: '...' }
```

### Step 4: Test Frontend Flow

```bash
# Start frontend
cd frontend
npm run dev
```

1. Navigate to http://localhost:5173
2. Login as user
3. Select event and tickets
4. Click "Comprar Boletos"
5. Should redirect to MercadoPago (not show error)
6. Complete test payment
7. Should redirect to success page

---

## 📁 FILES CHANGED

### Backend (2 files)

1. **backend/.env** (Modified)
   - Fixed BACKEND_URL: `5000` → `5001`
   - Fixed FRONTEND_URL: `3000` → `5173`
   - Status: ✅ Complete

2. **backend/src/config/env.ts** (Enhanced)
   - Added BACKEND_URL, FRONTEND_URL, MERCADOPAGO_* to interface
   - Made URLs critical (validated at startup)
   - Added URL format validation
   - Exported typed configuration
   - Status: ✅ Complete

3. **backend/src/modules/payments/payment.service.ts** (Enhanced)
   - Use typed env config instead of process.env
   - Removed fallback logic (env is validated)
   - Enhanced MercadoPago API error logging
   - Added request/response debugging
   - Added preference creation logging
   - Status: ✅ Complete

---

## 🎯 SUMMARY OF FIXES

| Issue | Before | After | Impact |
|-------|--------|-------|--------|
| BACKEND_URL | `http://localhost:5000` | `http://localhost:5001` | ✅ Matches actual port |
| FRONTEND_URL | `http://localhost:3000` | `http://localhost:5173` | ✅ Matches Vite default |
| URL Validation | Not validated | Validated at startup | ✅ Fails fast on misconfiguration |
| Error Logging | Basic | Detailed with request/response | ✅ Easier debugging |
| Env Config | process.env with fallbacks | Typed config without fallbacks | ✅ Type-safe, fails fast |
| Preference Creation | Silent failures possible | Logged with full details | ✅ Visibility into issues |

---

## 🚀 DEPLOYMENT NOTES

### Production Configuration

**backend/.env (Production):**
```bash
NODE_ENV=production
PORT=5001

MONGODB_URI=mongodb://your-mongodb-cluster/ticketing-saas?replicaSet=rs0

JWT_SECRET=<strong-secret-min-64-chars-in-production>
JWT_EXPIRES_IN=7d

CORS_ORIGIN=https://yourdomain.com

# MercadoPago PRODUCTION credentials
MERCADOPAGO_ACCESS_TOKEN=APP_USR-PRODUCTION-TOKEN
MERCADOPAGO_WEBHOOK_SECRET=your-production-webhook-secret

# Production URLs (MUST be HTTPS)
BACKEND_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### MercadoPago Production Checklist

- [ ] Replace test credentials with production credentials
- [ ] BACKEND_URL uses HTTPS
- [ ] FRONTEND_URL uses HTTPS
- [ ] Webhook URL is publicly accessible
- [ ] Configure webhook URL in MercadoPago dashboard
- [ ] Test with real payment methods
- [ ] Verify signature validation works
- [ ] Monitor webhook failures

---

## ✅ SUCCESS CRITERIA

**Development:**
- ✅ Backend starts without environment variable errors
- ✅ Order creation returns valid MercadoPago initPoint
- ✅ User redirects to MercadoPago checkout
- ✅ MercadoPago redirects back to correct frontend URLs
- ✅ Detailed logs for debugging

**Production:**
- ✅ Webhook receives notifications from MercadoPago
- ✅ Orders transition to PAID status
- ✅ Tickets are issued automatically
- ✅ Users can view tickets with QR codes
- ✅ All URLs use HTTPS

---

**Status: ✅ COMPLETE - MercadoPago preference creation fixed**
