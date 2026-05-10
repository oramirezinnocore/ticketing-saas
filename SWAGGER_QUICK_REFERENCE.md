# Swagger Quick Reference

## 🚀 Access Swagger UI

**URL:** http://localhost:5001/api/docs

```bash
cd backend
npm run dev
# Visit: http://localhost:5001/api/docs
```

---

## 📝 Example Annotations

### Basic GET Endpoint

```typescript
/**
 * @swagger
 * /resource:
 *   get:
 *     summary: Get all resources
 *     tags: [ResourceTag]
 *     responses:
 *       200:
 *         description: List of resources
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Resource'
 */
router.get('/resource', controller.getAll);
```

---

### GET with Path Parameter

```typescript
/**
 * @swagger
 * /resource/{id}:
 *   get:
 *     summary: Get resource by ID
 *     tags: [ResourceTag]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID (MongoDB ObjectId)
 *         example: "6a00df362608c2a32d66923b"
 *     responses:
 *       200:
 *         description: Resource found
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/resource/:id', controller.getById);
```

---

### POST with Authentication

```typescript
/**
 * @swagger
 * /resource:
 *   post:
 *     summary: Create new resource
 *     tags: [ResourceTag]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Resource Name"
 *               description:
 *                 type: string
 *                 example: "Resource description"
 *     responses:
 *       201:
 *         description: Resource created
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/resource', authenticate, controller.create);
```

---

### DELETE with Authorization

```typescript
/**
 * @swagger
 * /resource/{id}:
 *   delete:
 *     summary: Delete resource
 *     tags: [ResourceTag]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "6a00df362608c2a32d66923b"
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', authenticate, authorize('admin'), controller.delete);
```

---

### Multipart File Upload

```typescript
/**
 * @swagger
 * /upload/image:
 *   post:
 *     summary: Upload image file
 *     tags: [Upload]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPG, PNG, WEBP, max 5MB)
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UploadResponse'
 */
router.post('/upload/image', authenticate, upload.single('image'), controller.upload);
```

---

## 🔐 JWT Authentication in Swagger

### 1. Login to Get Token

```
POST /auth/login

Body:
{
  "email": "user@example.com",
  "password": "Password123!"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Authorize in Swagger UI

1. Click **"Authorize"** button (top right, lock icon)
2. Paste token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Click **"Authorize"**
4. Click **"Close"**

### 3. Test Protected Endpoint

All endpoints with `security: - BearerAuth: []` now include the token automatically.

---

## 📦 Using Reusable Schemas

### In swagger.ts

```typescript
components: {
  schemas: {
    YourSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' }
      }
    }
  }
}
```

### In route annotation

```typescript
/**
 * @swagger
 * /resource:
 *   get:
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/YourSchema'
 */
```

---

## 🎯 Common Response References

### Unauthorized (401)

```typescript
responses:
  401:
    $ref: '#/components/responses/UnauthorizedError'
```

### Forbidden (403)

```typescript
responses:
  403:
    $ref: '#/components/responses/ForbiddenError'
```

### Not Found (404)

```typescript
responses:
  404:
    $ref: '#/components/responses/NotFoundError'
```

### Validation Error (400)

```typescript
responses:
  400:
    $ref: '#/components/responses/ValidationError'
```

---

## 🏷️ Tags

Group endpoints by feature:

```typescript
tags: [Authentication]
tags: [Events]
tags: [Payments]
tags: [Upload]
```

Defined in `swagger.ts:343-372`

---

## 🧪 Testing in Swagger UI

### 1. Find Your Endpoint
- Scroll or use tags to filter
- Click to expand

### 2. Click "Try it out"
- Button in top right of endpoint section

### 3. Fill Parameters/Body
- Path params auto-populate
- Edit body JSON

### 4. Click "Execute"
- See request sent
- View response

### 5. Check Response
- Status code
- Headers
- Body

---

## ⚙️ Swagger Configuration

**File:** `backend/src/config/swagger.ts`

**Key Sections:**
- `info` - API metadata
- `servers` - API base URLs
- `components.securitySchemes` - Auth setup
- `components.schemas` - Reusable data models
- `components.responses` - Reusable error responses
- `tags` - Endpoint grouping

---

## 🔄 Updating Documentation

### After Changing Routes

1. **Update JSDoc annotation** in route file
2. **Restart server:** `npm run dev`
3. **Refresh Swagger UI:** http://localhost:5001/api/docs
4. **Verify changes** appear correctly

### Adding New Schema

1. **Edit** `backend/src/config/swagger.ts`
2. Add to `components.schemas`
3. **Restart server**
4. **Reference** in routes: `$ref: '#/components/schemas/NewSchema'`

---

## 📊 Current Modules

| Module | Status | Endpoints |
|--------|--------|-----------|
| Authentication | ✅ Complete | 3 |
| Events | ✅ Complete | 4 |
| Upload | ✅ Complete | 1 |
| Static Files | ✅ Complete | 1 |
| Payments | ✅ Complete | 4 |
| Orders | ⚠️ Not Implemented | 0 |
| Tickets | ⚠️ Not Implemented | 0 |
| Users | ⚠️ Not Implemented | 0 |

**Total Documented:** 13 endpoints  
**Coverage:** 100% of implemented endpoints

---

## 🎯 Quick Commands

```bash
# Start backend with Swagger
cd backend
npm run dev

# Visit Swagger UI
open http://localhost:5001/api/docs

# Type check
npm run type-check

# Lint
npm run lint
```

---

**Full Guide:** See `SWAGGER_DOCUMENTATION_GUIDE.md`
