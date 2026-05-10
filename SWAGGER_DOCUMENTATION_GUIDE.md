# Swagger/OpenAPI Documentation Guide

## 📋 Overview

Complete API documentation using **Swagger/OpenAPI 3.0** with **swagger-jsdoc** for automatic generation from JSDoc comments.

**Swagger UI URL:** http://localhost:5001/api/docs

---

## 🏗️ Architecture

### Technology Stack

- **OpenAPI Version:** 3.0.0
- **Generation:** swagger-jsdoc
- **UI:** swagger-ui-express
- **Format:** JSDoc annotations in route files

### File Structure

```
backend/src/
├── config/
│   └── swagger.ts          # Swagger configuration & schemas
├── modules/
│   ├── auth/
│   │   └── auth.routes.ts  # @swagger annotations
│   ├── events/
│   │   └── event.routes.ts # @swagger annotations
│   ├── payments/
│   │   └── payment.routes.ts # @swagger annotations
│   └── upload/
│       └── upload.routes.ts # @swagger annotations
└── app.ts                   # Swagger UI setup
```

### Auto-Generation Flow

```
┌─────────────────────────────────────────────────┐
│ 1. Write JSDoc @swagger annotations in routes  │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 2. swagger-jsdoc scans files on startup         │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 3. Generates OpenAPI 3.0 specification          │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 4. swagger-ui-express renders interactive UI    │
└─────────────────────────────────────────────────┘
                 │
                 ▼
         http://localhost:5001/api/docs
```

---

## 🔐 JWT Authentication Setup

### Security Scheme Configuration

**File:** `backend/src/config/swagger.ts:32-39`

```typescript
components: {
  securitySchemes: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter JWT token obtained from /auth/login or /auth/register',
    },
  },
}
```

### Using Authentication in Endpoints

**In route annotations:**

```yaml
security:
  - BearerAuth: []
```

**Example:**

```typescript
/**
 * @swagger
 * /events:
 *   post:
 *     security:
 *       - BearerAuth: []
 */
```

### Testing Authentication in Swagger UI

1. Click **"Authorize"** button in top right
2. Enter JWT token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Click **"Authorize"**
4. Click **"Close"**
5. All protected endpoints now include the token automatically

---

## 📚 Reusable Schemas

### Common Schemas

**File:** `backend/src/config/swagger.ts:40-280`

#### User Schema
```yaml
$ref: '#/components/schemas/User'
```

Properties: `id`, `name`, `email`, `role`, `createdAt`, `updatedAt`

#### Event Schema
```yaml
$ref: '#/components/schemas/Event'
```

Properties: `id`, `title`, `description`, `date`, `organizerId`, `ticketTypes[]`, `coverImageUrl`, `coverImageAlt`, `createdAt`, `updatedAt`

#### TicketType Schema
```yaml
$ref: '#/components/schemas/TicketType'
```

Properties: `name`, `price`, `quantity`, `quantityAvailable`

#### Order Schema
```yaml
$ref: '#/components/schemas/Order'
```

Properties: `id`, `userId`, `eventId`, `tickets[]`, `total`, `status`, `expiresAt`, `createdAt`, `updatedAt`

#### Payment Schema
```yaml
$ref: '#/components/schemas/Payment'
```

Properties: `id`, `orderId`, `amount`, `status`, `paymentMethod`, `externalId`, `webhookProcessed`, `createdAt`, `updatedAt`

#### UploadResponse Schema
```yaml
$ref: '#/components/schemas/UploadResponse'
```

Properties: `url`, `filename`, `originalName`, `mimetype`, `size`

#### PaymentPreference Schema
```yaml
$ref: '#/components/schemas/PaymentPreference'
```

Properties: `preferenceId`, `initPoint`, `payment`

### Common Responses

**File:** `backend/src/config/swagger.ts:281-341`

#### Unauthorized Error
```yaml
$ref: '#/components/responses/UnauthorizedError'
```

HTTP 401 - "Authentication required or token invalid"

#### Forbidden Error
```yaml
$ref: '#/components/responses/ForbiddenError'
```

HTTP 403 - "Insufficient permissions"

#### Not Found Error
```yaml
$ref: '#/components/responses/NotFoundError'
```

HTTP 404 - "Resource not found"

#### Validation Error
```yaml
$ref: '#/components/responses/ValidationError'
```

HTTP 400 - "Validation failed"

---

## 📝 Example Endpoint Annotations

### Complete Example: POST /events

**File:** `backend/src/modules/events/event.routes.ts:39-110`

```typescript
/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event (Organizer only)
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - date
 *               - ticketTypes
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 300
 *                 example: Tech Conference 2024
 *               description:
 *                 type: string
 *                 example: Annual technology conference
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-12-15T10:00:00Z
 *               coverImageUrl:
 *                 type: string
 *                 description: Relative path from upload endpoint
 *                 example: /uploads/events/1715270400000-abc.jpg
 *               coverImageAlt:
 *                 type: string
 *                 example: Tech Conference 2024 banner
 *               ticketTypes:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - price
 *                     - quantity
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: General Admission
 *                     price:
 *                       type: number
 *                       minimum: 0
 *                       example: 50.00
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 100
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post(
  '/',
  authenticate,
  authorize('organizer', 'admin'),
  [
    body('title').trim().notEmpty()...,
    body('description').trim().notEmpty()...,
    // ... validators
    validateRequest,
  ],
  eventController.createEvent
);
```

### Key Components Explained

1. **Summary:** Short description (shown in list)
2. **Tags:** Groups endpoint under category
3. **Security:** Requires JWT authentication
4. **RequestBody:** Defines expected input
5. **Responses:** All possible HTTP responses

---

## 🔄 Complete Module Documentation

### Authentication Module ✅

**File:** `backend/src/modules/auth/auth.routes.ts`

**Endpoints:**
- ✅ `POST /auth/register` - Register new user
- ✅ `POST /auth/login` - Login user
- ✅ `GET /auth/verify` - Verify JWT token

**Status:** Fully documented

---

### Events Module ✅

**File:** `backend/src/modules/events/event.routes.ts`

**Endpoints:**
- ✅ `GET /events` - List all events
- ✅ `GET /events/:id` - Get event by ID
- ✅ `POST /events` - Create event (organizer/admin)
- ✅ `DELETE /events/:id` - Delete event (organizer owner/admin)

**Special Fields:**
- `coverImageUrl`: Relative path (e.g., `/uploads/events/abc.jpg`)
- `coverImageAlt`: Alt text for accessibility

**Status:** Fully documented

---

### Upload Module ✅

**File:** `backend/src/modules/upload/upload.routes.ts`

**Endpoints:**
- ✅ `POST /upload/event-image` - Upload event cover image

**Request Format:** `multipart/form-data`

**Field Name:** `image`

**Validation:**
- **Allowed types:** JPG, PNG, WEBP
- **Max size:** 5MB
- **Recommended:** 1920x1080px or higher

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "/uploads/events/1715270400000-abc.jpg",
    "filename": "1715270400000-abc.jpg",
    "originalName": "poster.jpg",
    "mimetype": "image/jpeg",
    "size": 2048576
  }
}
```

**Status:** Fully documented

---

### Static Files Module ✅

**Path:** `/uploads/events/{filename}`

**Method:** GET

**Description:** Serves uploaded event cover images via Express.static

**Authentication:** Not required (public)

**Example:**
```
GET http://localhost:5001/uploads/events/1715270400000-abc.jpg
→ Returns: Binary image data (image/jpeg, image/png, or image/webp)
```

**Status:** Documented in swagger config paths

---

### Payments Module ✅

**File:** `backend/src/modules/payments/payment.routes.ts`

**Endpoints:**
- ✅ `POST /payments/preference` - Create MercadoPago payment preference
- ✅ `POST /payments/webhook` - MercadoPago webhook handler
- ✅ `GET /payments/order/:orderId` - Get payment by order ID
- ✅ `GET /payments/:id` - Get payment by ID

**MercadoPago Flow:**

```
1. POST /payments/preference
   ↓
2. Receive { preferenceId, initPoint }
   ↓
3. Redirect user to initPoint (MercadoPago checkout)
   ↓
4. User completes payment
   ↓
5. MercadoPago sends webhook to POST /payments/webhook
   ↓
6. Backend updates order and payment status
   ↓
7. User redirected back to app (success/failure page)
```

**Webhook Security:**
- Signature verification via `x-signature` header
- Idempotent processing (safe to retry)

**Status:** Newly documented ✅

---

### Orders Module ⚠️

**File:** `backend/src/modules/orders/order.routes.ts`

**Status:** NOT IMPLEMENTED - Routes file is empty

**Planned Endpoints:**
- POST /orders - Create order
- GET /orders/:id - Get order by ID
- GET /orders/my-orders - Get current user's orders

---

### Tickets Module ⚠️

**File:** `backend/src/modules/tickets/ticket.routes.ts`

**Status:** NOT IMPLEMENTED - Routes file is empty

**Planned Endpoints:**
- GET /tickets/my-tickets - Get user's tickets
- POST /tickets/validate - Validate ticket QR code

---

### Users Module ⚠️

**File:** `backend/src/modules/users/user.routes.ts`

**Status:** NOT IMPLEMENTED - Routes file is empty

**Planned Endpoints:**
- GET /users/me - Get current user profile
- PATCH /users/me - Update current user profile

---

## 🎯 API Tags

Endpoints are organized by tags in Swagger UI:

| Tag | Description | Endpoints |
|-----|-------------|-----------|
| **Authentication** | User auth and registration | 3 endpoints |
| **Events** | Event management (CRUD) | 4 endpoints |
| **Upload** | File upload for images | 1 endpoint |
| **Static Files** | Public image serving | 1 endpoint |
| **Payments** | MercadoPago integration | 4 endpoints |
| **Orders** | Order management | 0 (not implemented) |
| **Tickets** | Ticket validation | 0 (not implemented) |
| **Users** | User profile management | 0 (not implemented) |

---

## 🚀 Running the Backend

### Development Mode

```bash
cd backend
npm install
npm run dev
```

**Server:** http://localhost:5001

### Access Swagger UI

**URL:** http://localhost:5001/api/docs

### Test Authentication Flow

1. **Register User:**
   - Expand `POST /auth/register`
   - Click "Try it out"
   - Fill in body:
     ```json
     {
       "name": "Test User",
       "email": "test@example.com",
       "password": "Password123!"
     }
     ```
   - Click "Execute"
   - Copy token from response

2. **Authorize:**
   - Click "Authorize" button (top right)
   - Paste token
   - Click "Authorize" → "Close"

3. **Test Protected Endpoint:**
   - Expand `POST /events`
   - Click "Try it out"
   - Fill in event data
   - Click "Execute"
   - Should succeed (201 Created)

---

## 📖 Writing New Swagger Documentation

### Step 1: Add JSDoc Comment Above Route

```typescript
/**
 * @swagger
 * /your-endpoint:
 *   method:
 *     summary: Short description
 *     tags: [TagName]
 */
router.method('/your-endpoint', handler);
```

### Step 2: Define Request Body (if applicable)

```typescript
/**
 * @swagger
 * /your-endpoint:
 *   post:
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - field1
 *             properties:
 *               field1:
 *                 type: string
 *                 example: "Example value"
 */
```

### Step 3: Define Parameters (if applicable)

```typescript
/**
 * @swagger
 * /your-endpoint/{id}:
 *   get:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 */
```

### Step 4: Define Responses

```typescript
/**
 * @swagger
 * /your-endpoint:
 *   get:
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/YourSchema'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
```

### Step 5: Add Security (if protected)

```typescript
/**
 * @swagger
 * /your-endpoint:
 *   get:
 *     security:
 *       - BearerAuth: []
 */
```

### Step 6: Restart Server

```bash
# Changes to annotations require server restart
npm run dev
```

### Step 7: Verify in Swagger UI

Visit http://localhost:5001/api/docs and check your endpoint appears correctly.

---

## 🎨 Best Practices

### 1. Use Reusable Schemas

❌ **Bad:**
```typescript
properties:
  user:
    type: object
    properties:
      id:
        type: string
      name:
        type: string
```

✅ **Good:**
```typescript
properties:
  user:
    $ref: '#/components/schemas/User'
```

### 2. Use Common Responses

❌ **Bad:**
```typescript
401:
  description: Unauthorized
  content:
    application/json:
      schema:
        type: object
        properties:
          success:
            type: boolean
```

✅ **Good:**
```typescript
401:
  $ref: '#/components/responses/UnauthorizedError'
```

### 3. Include Examples

✅ **Always include examples:**
```typescript
example: "Tech Conference 2024"
```

### 4. Document All Responses

Include success (200, 201) AND error responses (400, 401, 403, 404)

### 5. Group by Tags

Use consistent tag names to organize endpoints logically

### 6. Add Descriptions

Explain WHY, not just WHAT:

```typescript
description: 'Returns relative path (e.g., /uploads/events/abc.jpg) that frontend will resolve to full URL based on environment'
```

---

## 🐛 Troubleshooting

### Issue: Swagger UI shows empty/no endpoints

**Cause:** JSDoc comments not found

**Solution:**
1. Check `swagger.ts` apis paths:
   ```typescript
   apis: ['./src/modules/*/**.routes.ts']
   ```
2. Ensure comments start with `/**` (not `/*`)
3. Restart server

### Issue: Schema not found

**Cause:** Schema not defined in swagger.ts

**Solution:** Add schema to `components.schemas` in `swagger.ts`

### Issue: Authentication doesn't work in Swagger UI

**Cause:** Token format wrong or not configured

**Solution:**
1. Click "Authorize"
2. Enter ONLY the token (no "Bearer" prefix)
3. Swagger adds "Bearer" automatically

### Issue: Multipart/form-data not working

**Cause:** Wrong content-type in annotation

**Solution:**
```typescript
requestBody:
  content:
    multipart/form-data:
      schema:
        type: object
        properties:
          image:
            type: string
            format: binary
```

---

## 📊 Documentation Coverage

### Current Status

| Module | Routes | Documented | Coverage |
|--------|--------|------------|----------|
| Auth | 3 | 3 | ✅ 100% |
| Events | 4 | 4 | ✅ 100% |
| Upload | 1 | 1 | ✅ 100% |
| Static Files | 1 | 1 | ✅ 100% |
| Payments | 4 | 4 | ✅ 100% |
| Orders | 0 | 0 | ⚠️ N/A (not implemented) |
| Tickets | 0 | 0 | ⚠️ N/A (not implemented) |
| Users | 0 | 0 | ⚠️ N/A (not implemented) |

**Total Implemented:** 13 endpoints  
**Total Documented:** 13 endpoints  
**Documentation Coverage:** ✅ **100%**

---

## 🎯 Summary

### What Was Completed

1. ✅ **Auth Module** - Fully documented (register, login, verify)
2. ✅ **Events Module** - Fully documented (CRUD + delete)
3. ✅ **Upload Module** - Fully documented (multipart upload)
4. ✅ **Static Files** - Documented in swagger config
5. ✅ **Payments Module** - Newly documented (preference, webhook, queries)
6. ✅ **Reusable Schemas** - Event, User, Payment, Order, UploadResponse, etc.
7. ✅ **Common Responses** - 401, 403, 404, 400 errors
8. ✅ **JWT Auth Setup** - BearerAuth security scheme
9. ✅ **Auto-Generation** - swagger-jsdoc with JSDoc annotations
10. ✅ **Developer Experience** - Examples, descriptions, tags

### What's Missing

- ⚠️ Orders, Tickets, Users modules (not implemented yet)

### Key Features

- 🔒 JWT authentication documented
- 🖼️ Image upload flow explained
- 💳 MercadoPago integration documented
- 🔄 Idempotent webhook processing documented
- 📝 JSDoc annotations for auto-generation
- 🎨 Grouped by tags for easy navigation
- 📦 Reusable schemas and responses
- 🧪 Try it out functionality with auth

---

**Swagger UI:** http://localhost:5001/api/docs  
**Documentation Version:** 1.0.0  
**Last Updated:** 2026-05-10  
**Status:** ✅ Complete for implemented modules
