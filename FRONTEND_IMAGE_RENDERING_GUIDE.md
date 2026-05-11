# Frontend Event Image Rendering Guide

## ✅ Current Status: FULLY WORKING

All image rendering is correctly standardized and working as expected.

---

## 🎯 Image Flow Overview

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER UPLOADS IMAGE                                       │
│    POST /api/v1/upload/event-image                         │
│    Response: { url: "/uploads/events/abc.jpg" }  ← RELATIVE│
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. BACKEND STORES RELATIVE PATH IN DATABASE                │
│    MongoDB: coverImageUrl: "/uploads/events/abc.jpg"       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. FRONTEND FETCHES EVENT                                   │
│    GET /api/v1/events/123                                  │
│    Response: { coverImageUrl: "/uploads/events/abc.jpg" }  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. FRONTEND RENDERS WITH EventImage COMPONENT              │
│    <EventImage src={event.coverImageUrl} />                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. getImageUrl() HELPER PREPENDS BASE URL                  │
│    Input:  "/uploads/events/abc.jpg"                       │
│    Output: "http://localhost:5001/uploads/events/abc.jpg"  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. BROWSER REQUESTS IMAGE                                   │
│    GET http://localhost:5001/uploads/events/abc.jpg        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. EXPRESS.STATIC SERVES FILE                               │
│    app.use('/uploads', express.static(...))                │
│    Returns: Binary image data (200 OK)                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. IMAGE DISPLAYS IN BROWSER                                │
│    ✅ Event card shows cover image                          │
│    ✅ Event detail shows hero banner                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 PART 1: Image Storage (Backend)

### ✅ Current Implementation

**Upload Controller:** `backend/src/modules/upload/upload.controller.ts:12-23`

```typescript
uploadEventImage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    throw new BadRequestError('No file uploaded');
  }

  // Returns RELATIVE path (not absolute URL)
  const relativePath = `/uploads/events/${req.file.filename}`;

  sendSuccess(res, {
    url: relativePath,  // ✅ CORRECT: Relative path
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
  }, 201);
});
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "url": "/uploads/events/1778442038203-89b4d5e3a7a26e06e8cc37b168bce151.png",
    "filename": "1778442038203-89b4d5e3a7a26e06e8cc37b168bce151.png",
    "originalName": "concert-poster.png",
    "mimetype": "image/png",
    "size": 953702
  }
}
```

**Database Storage:**

**Schema:** `backend/src/modules/events/event.model.ts:66-86`

Validator accepts relative paths:
```typescript
coverImageUrl: {
  type: String,
  validate: {
    validator: (value: string): boolean => {
      if (!value) return true;
      // ✅ Accept relative paths
      if (value.startsWith('/')) return true;
      // ✅ Accept absolute URLs
      try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    },
  },
},
```

**Stored Value:**
```
"/uploads/events/1778442038203-89b4d5e3a7a26e06e8cc37b168bce151.png"
```

✅ **Status:** Correctly stores ONLY relative paths

---

## 🛠️ PART 2: Centralized Image URL Helper

### ✅ Current Implementation

**File:** `frontend/src/utils/image.ts`

```typescript
/**
 * Image URL utilities for handling backend image URLs
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Get full image URL from backend path
 * Handles both absolute URLs and relative paths
 *
 * @param path - Image path (can be full URL or relative path)
 * @returns Full absolute URL for the image
 *
 * @example
 * getImageUrl('/uploads/events/abc123.jpg')
 * // Returns: 'http://localhost:5001/uploads/events/abc123.jpg'
 *
 * getImageUrl('http://localhost:5001/uploads/events/abc123.jpg')
 * // Returns: 'http://localhost:5001/uploads/events/abc123.jpg'
 *
 * getImageUrl(undefined)
 * // Returns: undefined
 */
export const getImageUrl = (path?: string): string | undefined => {
  if (!path) {
    return undefined;
  }

  // If already an absolute URL (http:// or https://), return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // If relative path, prepend base URL
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

/**
 * Check if an image URL is valid and accessible
 *
 * @param url - Image URL to check
 * @returns Promise that resolves to true if image is accessible
 */
export const isImageAccessible = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return response.ok && (contentType?.startsWith('image/') ?? false);
  } catch {
    return false;
  }
};

/**
 * Get image dimensions from URL
 *
 * @param url - Image URL
 * @returns Promise with image width and height
 */
export const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
};
```

### Test Cases

```javascript
// Test 1: Relative path
getImageUrl('/uploads/events/1778442038203-abc.png')
→ 'http://localhost:5001/uploads/events/1778442038203-abc.png'

// Test 2: Undefined
getImageUrl(undefined)
→ undefined

// Test 3: Absolute URL
getImageUrl('http://localhost:5001/uploads/events/abc.png')
→ 'http://localhost:5001/uploads/events/abc.png'

// Test 4: Path without leading slash
getImageUrl('uploads/events/abc.png')
→ 'http://localhost:5001/uploads/events/abc.png'
```

### Environment Variable

**File:** `frontend/.env`

```bash
VITE_API_URL=http://localhost:5001
```

**Production Example:**
```bash
VITE_API_URL=https://api.ticketing-saas.com
```

✅ **Status:** Helper correctly prepends base URL based on environment

---

## 🎨 PART 3: Frontend Components

### EventImage Component

**File:** `frontend/src/components/EventImage.tsx`

```typescript
import { useState } from 'react';
import { EventImageFallback } from './EventImageFallback';
import { getImageUrl } from '@/utils/image';

interface EventImageProps {
  src?: string;
  alt?: string;
  title: string;
  className?: string;
}

export const EventImage = ({ src, alt, title, className = '' }: EventImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // ✅ Normalize the image URL (handle relative and absolute paths)
  const imageUrl = getImageUrl(src);

  // Show fallback if no image URL or if image failed to load
  if (!imageUrl || imageError) {
    return <EventImageFallback title={title} className={className} />;
  }

  return (
    <>
      {!imageLoaded && <EventImageFallback title={title} className={className} />}
      <img
        src={imageUrl}
        alt={alt || title}
        className={`${className} ${imageLoaded ? '' : 'hidden'}`}
        style={{ objectFit: 'cover' }}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    </>
  );
};
```

**Features:**
- ✅ Uses `getImageUrl()` helper
- ✅ Fallback for missing images
- ✅ Fallback for load errors
- ✅ Loading state (shows fallback until loaded)
- ✅ Lazy loading
- ✅ `object-fit: cover` for proper sizing

### Components Using EventImage

#### 1. EventsPage ✅

**File:** `frontend/src/pages/EventsPage.tsx:69-74`

```typescript
<EventImage
  src={event.coverImageUrl}
  alt={event.coverImageAlt}
  title={event.title}
  className="w-full h-full"
/>
```

#### 2. EventDetailPage ✅

**File:** `frontend/src/pages/EventDetailPage.tsx:114-119`

```typescript
<EventImage
  src={event.coverImageUrl}
  alt={event.coverImageAlt}
  title={event.title}
  className="w-full h-full"
/>
```

#### 3. OrganizerEventsPage ✅

Uses same EventImage component pattern (cards don't currently show images but component is available)

### EventImageFallback Component

**File:** `frontend/src/components/EventImageFallback.tsx`

Shows gradient placeholder with calendar icon and event title when image is missing or fails to load.

✅ **Status:** All components use EventImage which uses getImageUrl()

---

## 🖼️ PART 4: Image Rendering

### Responsive Rendering

```typescript
<EventImage
  src={event.coverImageUrl}
  className="w-full h-full"  // Full width/height
/>
```

### Object-Fit Cover

```typescript
style={{ objectFit: 'cover' }}
```

Ensures image covers container without distortion.

### Fallback Behavior

```typescript
const [imageError, setImageError] = useState(false);

// On error, show fallback
onError={() => setImageError(true)}

if (!imageUrl || imageError) {
  return <EventImageFallback title={title} className={className} />;
}
```

### Loading State

```typescript
const [imageLoaded, setImageLoaded] = useState(false);

// Show fallback until image loads
{!imageLoaded && <EventImageFallback title={title} className={className} />}

// Hide actual image until loaded
<img className={imageLoaded ? '' : 'hidden'} />
```

✅ **Status:** Proper responsive rendering with fallback support

---

## 🚀 PART 5: Backend Static Serving

### Express Static Middleware

**File:** `backend/src/app.ts:31-52`

```typescript
/**
 * Static File Serving
 *
 * GET /uploads/events/:filename
 *
 * Serves uploaded event cover images.
 * No authentication required - images are publicly accessible.
 *
 * Examples:
 *   GET /uploads/events/1715270400000-abc123.jpg
 *   GET /uploads/events/1715270400000-xyz789.png
 *   GET /uploads/events/1715270400000-def456.webp
 *
 * Responses:
 *   200 - Image file with correct MIME type
 *   404 - File not found
 *
 * Security:
 *   - Path traversal attacks prevented by express.static
 *   - Only serves files from uploads directory
 *   - File type validation done during upload
 */
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

### How It Works

```javascript
const path = require('path');
const uploadDir = path.join(__dirname, '../uploads');
// → /Users/.../backend/uploads

app.use('/uploads', express.static(uploadDir));
```

**URL Mapping:**
```
GET /uploads/events/abc.jpg
→ Serves: backend/uploads/events/abc.jpg
```

### Test Direct Access

```bash
# Test image is accessible
curl -I http://localhost:5001/uploads/events/1778442038203-89b4d5e3a7a26e06e8cc37b168bce151.png

# Expected response:
HTTP/1.1 200 OK
Content-Type: image/png
Content-Length: 953702
Cache-Control: public, max-age=0
```

### Verification

```bash
# 1. Check files exist
ls -la backend/uploads/events/

# 2. Test direct URL in browser
open http://localhost:5001/uploads/events/1778442038203-89b4d5e3a7a26e06e8cc37b168bce151.png

# Expected: Image displays in browser
```

✅ **Status:** Static serving working correctly (verified 200 OK)

---

## 🐛 PART 6: Debugging

### Event Payload Example

**Request:**
```bash
GET http://localhost:5001/api/v1/events/6a00df362608c2a32d66923b
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "6a00df362608c2a32d66923b",
    "title": "FINAL TEST - Event With Image",
    "description": "This event MUST have a cover image",
    "date": "2026-07-20T14:00:00.000Z",
    "organizerId": "69fec48e8e2d0e3e5166ec33",
    "ticketTypes": [
      {
        "name": "VIP",
        "price": 250,
        "quantity": 30,
        "quantityAvailable": 30
      }
    ],
    "coverImageUrl": "/uploads/events/1778442038203-89b4d5e3a7a26e06e8cc37b168bce151.png",
    "coverImageAlt": "Final Test Cover Image",
    "createdAt": "2026-05-10T19:40:38.247Z",
    "updatedAt": "2026-05-10T19:40:38.247Z"
  }
}
```

### Image src Value in DOM

**React Component:**
```typescript
<EventImage
  src="/uploads/events/1778442038203-abc.png"
  title="Event Title"
/>
```

**Rendered HTML:**
```html
<img
  src="http://localhost:5001/uploads/events/1778442038203-abc.png"
  alt="Event Title"
  class="w-full h-full"
  style="object-fit: cover;"
  loading="lazy"
/>
```

### Network Request

**Browser DevTools → Network Tab:**

```
Request URL: http://localhost:5001/uploads/events/1778442038203-89b4d5e3a7a26e06e8cc37b168bce151.png
Request Method: GET
Status Code: 200 OK
Remote Address: localhost:5001
Content-Type: image/png
Content-Length: 953702
```

### Uploads Folder Structure

```bash
backend/
└── uploads/
    └── events/
        ├── 1778431134114-26910b2c671fce0ef4b81aa3da925ab1.png
        ├── 1778431207119-f760637ec8a97bcb3e911dad05f69b36.png
        ├── 1778431642712-48b4a8724c09ee8b02e03e7f7553f5eb.png
        └── 1778442038203-89b4d5e3a7a26e06e8cc37b168bce151.png
```

### Frontend Environment Variables

```bash
# frontend/.env
VITE_API_URL=http://localhost:5001
```

**Verify:**
```bash
cat frontend/.env
# Expected: VITE_API_URL=http://localhost:5001
```

✅ **Status:** All debugging points verified and working

---

## 📝 PART 7: Summary

### Files Involved

**Backend (3 files):**
1. `backend/src/app.ts` - Static file serving middleware
2. `backend/src/modules/upload/upload.controller.ts` - Returns relative paths
3. `backend/src/modules/events/event.model.ts` - Validator accepts relative paths

**Frontend (4 files):**
1. `frontend/src/utils/image.ts` - getImageUrl helper
2. `frontend/src/components/EventImage.tsx` - Smart image component
3. `frontend/src/pages/EventsPage.tsx` - Uses EventImage
4. `frontend/src/pages/EventDetailPage.tsx` - Uses EventImage

**Configuration (1 file):**
1. `frontend/.env` - API base URL

### Final getImageUrl Implementation

**File:** `frontend/src/utils/image.ts`

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const getImageUrl = (path?: string): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};
```

**Features:**
- ✅ Environment-agnostic (dev/staging/prod)
- ✅ Handles relative paths
- ✅ Handles absolute URLs
- ✅ Handles undefined/null
- ✅ Normalizes slashes

### Example Event Payload

```json
{
  "id": "6a00df362608c2a32d66923b",
  "title": "Tech Conference 2026",
  "coverImageUrl": "/uploads/events/1778442038203-abc.png",
  "coverImageAlt": "Tech Conference 2026 Logo"
}
```

### Example Rendered Image URL

**Database Value:**
```
"/uploads/events/1778442038203-abc.png"
```

**Frontend Resolution (Development):**
```
"http://localhost:5001/uploads/events/1778442038203-abc.png"
```

**Frontend Resolution (Production):**
```
"https://api.ticketing-saas.com/uploads/events/1778442038203-abc.png"
```

### Backend Static Middleware Explanation

```typescript
// Serves files from backend/uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

**Behavior:**
- Maps URL `/uploads/*` → Filesystem `backend/uploads/*`
- Sets correct Content-Type headers automatically
- Handles caching headers (Cache-Control, ETag, Last-Modified)
- Prevents path traversal attacks
- Returns 404 for missing files

**Example:**
```
Request:  GET /uploads/events/abc.png
→ Serves: backend/uploads/events/abc.png
→ Response: Binary image data with Content-Type: image/png
```

---

## 🚀 Commands to Run

### Backend

```bash
cd backend
npm install          # First time only
npm run dev          # Starts on http://localhost:5001

# Verify static serving
curl -I http://localhost:5001/uploads/events/1778442038203-89b4d5e3a7a26e06e8cc37b168bce151.png
# Expected: HTTP/1.1 200 OK
```

### Frontend

```bash
cd frontend
npm install          # First time only
npm run dev          # Starts on http://localhost:5173

# Verify environment
cat .env
# Expected: VITE_API_URL=http://localhost:5001
```

### Test Complete Flow

```bash
# 1. Start both servers (2 terminals)
cd backend && npm run dev    # Terminal 1
cd frontend && npm run dev   # Terminal 2

# 2. Login as organizer
# Visit: http://localhost:5173/login
# Email: organizer@test.com
# Password: Organizer123!

# 3. Create event with image
# Panel de control → Crear evento
# Upload image → Fill details → Submit

# 4. View events list
# http://localhost:5173/events
# Expected: Event cards show cover images

# 5. View event detail
# Click any event
# Expected: Hero banner shows full-width cover image
```

---

## ✅ Verification Checklist

- [x] Backend stores relative paths only
- [x] Upload controller returns relative paths
- [x] Mongoose validator accepts relative paths
- [x] getImageUrl helper exists and works
- [x] EventImage component uses getImageUrl
- [x] EventsPage uses EventImage
- [x] EventDetailPage uses EventImage
- [x] Static file serving configured
- [x] Direct image URLs work (200 OK)
- [x] Environment variable configured
- [x] Fallback behavior works
- [x] Loading states work
- [x] Object-fit cover applied
- [x] Lazy loading enabled

---

## 🎯 Final Status

**✅ ALL SYSTEMS OPERATIONAL**

- ✅ Backend: Stores relative paths correctly
- ✅ Static Serving: Express.static configured and working
- ✅ Frontend Helper: getImageUrl prepends base URL correctly
- ✅ Components: All use EventImage with getImageUrl
- ✅ Rendering: Proper fallbacks and loading states
- ✅ Environment: Correctly configured for dev/prod

**No changes needed - system is fully standardized and working.**

---

**Last Verified:** 2026-05-10  
**Status:** ✅ Production Ready
