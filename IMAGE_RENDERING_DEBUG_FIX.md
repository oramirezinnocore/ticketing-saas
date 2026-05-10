# Event Image Rendering - Debug & Fix Guide

## 🔍 Root Cause Analysis

### Problem Statement
Event cover images were **NOT displaying** in:
- `/events` - Events list page
- `/events/:id` - Event detail page

### Root Cause Identified

**The system is actually working correctly!** 

The real issue was:
1. ✅ **Backend upload works** - Files are saved to `backend/uploads/events/`
2. ✅ **Static serving works** - Express serves files from `/uploads` endpoint
3. ✅ **Frontend rendering works** - EventImage component with fallback exists
4. ❌ **No events have images** - Existing events were created **before** the image feature was added

**Conclusion:** Images aren't displaying because **no events in the database have `coverImageUrl` field**.

## 📊 System Status

### Backend ✅ Working

**Static File Serving:**
```typescript
// backend/src/app.ts
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

**Port:** 5001

**Image URL Format:**
```
http://localhost:5001/uploads/events/{filename}
```

**Upload Endpoint:**
```
POST /api/v1/upload/event-image
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Frontend ✅ Working

**EventImage Component:**
- ✅ Handles undefined URLs → shows fallback
- ✅ Handles image load errors → shows fallback
- ✅ Shows loading state → fallback while loading
- ✅ Lazy loading enabled
- ✅ Object-fit cover for proper sizing

**EventImageFallback Component:**
- ✅ Professional gradient placeholder
- ✅ Calendar icon
- ✅ Event title displayed
- ✅ Primary color theme

## 🛠️ Fixes Applied

### 1. Image URL Normalization Helper

**File:** `frontend/src/utils/image.ts` (NEW)

**Purpose:** Centralized URL handling for backend images

**Functions:**
```typescript
// Normalize image URLs (handle relative/absolute paths)
getImageUrl(path?: string): string | undefined

// Check if image is accessible
isImageAccessible(url: string): Promise<boolean>

// Get image dimensions
getImageDimensions(url: string): Promise<{width, height}>
```

**Usage:**
```typescript
import { getImageUrl } from '@/utils/image';

// Relative path
getImageUrl('/uploads/events/abc.jpg')
// Returns: 'http://localhost:5001/uploads/events/abc.jpg'

// Already absolute
getImageUrl('http://localhost:5001/uploads/events/abc.jpg')
// Returns: 'http://localhost:5001/uploads/events/abc.jpg'

// Undefined
getImageUrl(undefined)
// Returns: undefined
```

### 2. EventImage Component Updated

**File:** `frontend/src/components/EventImage.tsx`

**Changes:**
- Now uses `getImageUrl()` helper
- Normalizes all image URLs before rendering
- Maintains all existing fallback behavior

**Before:**
```typescript
<img src={src} ... />
```

**After:**
```typescript
const imageUrl = getImageUrl(src);
<img src={imageUrl} ... />
```

## 🧪 Testing Guide

### Step 1: Verify Backend Static Serving

**Test direct image URL access:**

```bash
# Start backend
cd backend
npm run dev

# In browser, visit:
http://localhost:5001/uploads/events/1778431134114-26910b2c671fce0ef4b81aa3da925ab1.png

# Expected: Image displays in browser
# If 404: Check uploads folder exists and has files
```

### Step 2: Create Event WITH Image

**Important:** Existing events don't have images!

```bash
# 1. Start both servers
cd backend && npm run dev  # Terminal 1
cd frontend && npm run dev  # Terminal 2

# 2. Login as organizer
# Visit: http://localhost:5173/login
# Email: organizer@test.com
# Password: Organizer123!

# 3. Create NEW event WITH image
# Go to: Panel de control → Crear evento
# Upload image in "Imagen de portada"
# Fill all fields
# Submit

# 4. Verify in events list
# Go to: Eventos
# Expected: See cover image on event card

# 5. Verify in event detail
# Click event card
# Expected: See hero banner with cover image
```

### Step 3: Verify API Response

```bash
# Check if event has coverImageUrl
curl -s http://localhost:5001/api/v1/events | python3 -m json.tool | grep -A 2 coverImageUrl

# Expected output:
# "coverImageUrl": "http://localhost:5001/uploads/events/abc123.jpg",
# "coverImageAlt": "Event Title"
```

### Step 4: Test Fallback Behavior

**Events WITHOUT images should show:**
- Gradient background (primary color)
- Calendar icon
- Event title in white
- Professional appearance

**Test:**
1. Create event WITHOUT uploading image
2. View in events list
3. Expected: Beautiful gradient fallback

## 🎯 Example Working Image URL

**Format:**
```
http://localhost:5001/uploads/events/{timestamp}-{hash}.{ext}
```

**Real Example:**
```
http://localhost:5001/uploads/events/1778431134114-26910b2c671fce0ef4b81aa3da925ab1.png
```

**Components:**
- **Protocol:** `http://`
- **Host:** `localhost:5001`
- **Path:** `/uploads/events/`
- **Filename:** `{timestamp}-{hash}.png`

## 📝 API Response Examples

### Event WITH Image

```json
{
  "id": "abc123",
  "title": "Tech Conference 2026",
  "description": "Annual tech conference",
  "date": "2026-06-15T10:00:00.000Z",
  "organizerId": "xyz789",
  "coverImageUrl": "http://localhost:5001/uploads/events/1778431134114-abc.png",
  "coverImageAlt": "Tech Conference 2026",
  "ticketTypes": [...],
  "createdAt": "2026-05-10T16:00:00.000Z",
  "updatedAt": "2026-05-10T16:00:00.000Z"
}
```

### Event WITHOUT Image

```json
{
  "id": "abc123",
  "title": "Tech Conference 2026",
  "description": "Annual tech conference",
  "date": "2026-06-15T10:00:00.000Z",
  "organizerId": "xyz789",
  // NO coverImageUrl field (or null/undefined)
  "ticketTypes": [...],
  "createdAt": "2026-05-10T16:00:00.000Z",
  "updatedAt": "2026-05-10T16:00:00.000Z"
}
```

## 🎨 Frontend Rendering Behavior

### EventImage Component Flow

```
┌─────────────────────────────┐
│ EventImage Component        │
│ src={event.coverImageUrl}   │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ getImageUrl(src)            │
│ - Normalizes URL            │
│ - Handles relative paths    │
└──────────┬──────────────────┘
           │
           ▼
      Has URL?
      /      \
    YES      NO
     │        │
     ▼        ▼
┌─────┐  ┌────────────┐
│Load │  │ Fallback   │
│Image│  │ Immediate  │
└──┬──┘  └────────────┘
   │
   ▼
Load Success?
   /    \
 YES    NO
  │      │
  ▼      ▼
┌────┐ ┌─────────┐
│Show│ │Fallback │
│Img │ │onError  │
└────┘ └─────────┘
```

### Event Card Appearance

**With Image:**
```
┌─────────────────────────┐
│ [Cover Image]           │
│ ▒▒▒ Gradient Overlay    │
│ Event Title (white)     │
├─────────────────────────┤
│ Description (truncated) │
│ 📅 15 de mayo de 2026   │
│ 🎫 100 boletos          │
│ Desde $250.00 MXN       │
└─────────────────────────┘
```

**Without Image (Fallback):**
```
┌─────────────────────────┐
│ ▓▓▓ Gradient (Primary)  │
│    📅 Calendar Icon     │
│    Event Title          │
├─────────────────────────┤
│ Description (truncated) │
│ 📅 15 de mayo de 2026   │
│ 🎫 100 boletos          │
│ Desde $250.00 MXN       │
└─────────────────────────┘
```

### Event Detail Hero

**With Image:**
```
┌────────────────────────────────────────┐
│                                        │
│  [Full-Width Hero Banner]              │
│  ▒▒▒▒ Dark Gradient Overlay            │
│                                        │
│  Event Title (Large, White)            │
│  📅 viernes, 15 de mayo ⏰ 10:00 AM    │
│                                        │
└────────────────────────────────────────┘
```

**Without Image (Fallback):**
```
┌────────────────────────────────────────┐
│                                        │
│  ▓▓▓▓ Gradient Hero (Primary)          │
│      📅 Large Calendar Icon            │
│      Event Title (Large, White)        │
│                                        │
│  📅 viernes, 15 de mayo ⏰ 10:00 AM    │
│                                        │
└────────────────────────────────────────┘
```

## 🐛 Debugging Checklist

### Backend Issues

- [ ] **Uploads folder exists:** `ls -la backend/uploads/events/`
- [ ] **Files present:** Check for `*.jpg`, `*.png`, `*.webp` files
- [ ] **Backend running:** Port 5001 active
- [ ] **Static serving works:** Visit `http://localhost:5001/uploads/events/{filename}`
- [ ] **CORS enabled:** Check network tab for CORS errors

### Frontend Issues

- [ ] **EventImage component imported:** Check EventsPage and EventDetailPage
- [ ] **getImageUrl helper works:** Check browser console for errors
- [ ] **Network tab:** Check image requests (should be 200 OK or fallback)
- [ ] **Browser console:** Check for image load errors
- [ ] **React DevTools:** Inspect EventImage props

### Database Issues

- [ ] **Event has coverImageUrl:** Check API response
- [ ] **URL format correct:** Should start with `http://localhost:5001/uploads/`
- [ ] **URL accessible:** Paste URL in browser, should display image

## 🔧 Common Issues & Fixes

### Issue 1: Images not displaying (404)

**Symptom:** Browser shows 404 for image URL

**Cause:** Image file doesn't exist or wrong path

**Fix:**
```bash
# Check if file exists
ls -la backend/uploads/events/

# Verify URL matches filename
# URL: http://localhost:5001/uploads/events/abc.jpg
# File: backend/uploads/events/abc.jpg
```

### Issue 2: CORS error

**Symptom:** CORS error in browser console

**Cause:** Backend CORS not configured for image requests

**Fix:** Already configured in `backend/src/app.ts`:
```typescript
app.use(corsMiddleware);
```

### Issue 3: All events show fallback

**Symptom:** No events show images, all show gradient fallback

**Cause:** Events don't have `coverImageUrl` in database

**Fix:** Create new events with image upload feature

### Issue 4: Wrong base URL

**Symptom:** Image URLs point to wrong host

**Cause:** `VITE_API_URL` environment variable wrong

**Fix:**
```bash
# frontend/.env
VITE_API_URL=http://localhost:5001
```

### Issue 5: Helmet blocking images

**Symptom:** Images blocked by Content Security Policy

**Cause:** Helmet security headers too strict

**Fix:** Already handled in `backend/src/middlewares/security.ts`

## 📊 Network Request Examples

### Successful Image Load

```http
GET /uploads/events/1778431134114-abc.png HTTP/1.1
Host: localhost:5001

HTTP/1.1 200 OK
Content-Type: image/png
Content-Length: 953702
Cache-Control: public, max-age=0
```

### Image Not Found

```http
GET /uploads/events/missing.png HTTP/1.1
Host: localhost:5001

HTTP/1.1 404 Not Found
Content-Type: text/html
```

**Result:** EventImage component shows fallback

## ✅ Verification Commands

### Check Backend Running
```bash
curl http://localhost:5001/health
# Expected: {"success":true,"data":{"status":"ok",...}}
```

### Check Static Serving
```bash
# List uploaded files
ls -la backend/uploads/events/

# Test direct access (replace with real filename)
curl -I http://localhost:5001/uploads/events/1778431134114-abc.png
# Expected: HTTP/1.1 200 OK
```

### Check Event API
```bash
# Get all events
curl -s http://localhost:5001/api/v1/events | python3 -m json.tool

# Count events with images
curl -s http://localhost:5001/api/v1/events | python3 -c "
import sys, json
data = json.load(sys.stdin)
with_images = sum(1 for e in data['data'] if e.get('coverImageUrl'))
print(f'Events with images: {with_images}/{len(data[\"data\"])}')
"
```

### Check Frontend Build
```bash
cd frontend
npm run type-check
# Expected: No TypeScript errors related to image handling
```

## 🚀 Running the Application

### Full Stack (Development)

```bash
# Terminal 1 - Backend
cd backend
npm install  # First time only
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install  # First time only
npm run dev

# Access:
# Frontend: http://localhost:5173
# Backend: http://localhost:5001
# Swagger: http://localhost:5001/api/docs
```

### Create Event with Image

1. **Login:** http://localhost:5173/login
   - Email: `organizer@test.com`
   - Password: `Organizer123!`

2. **Navigate:** Panel de control → Crear evento

3. **Upload Image:**
   - Drag & drop image to "Imagen de portada"
   - Or click to select file
   - Wait for upload success (green checkmark)

4. **Fill Form:**
   - Título: "Mi Evento Con Imagen"
   - Descripción: "Este evento tiene una imagen profesional"
   - Fecha: Select future date
   - Tipo de boleto: Name, price, quantity

5. **Submit:** Click "Crear evento"

6. **Verify:** Go to "Eventos" page
   - Should see event card with cover image
   - Click event → Should see hero banner with image

## 📚 Files Changed

### Created (1 file):
1. **`frontend/src/utils/image.ts`** (66 lines)
   - `getImageUrl()` - URL normalization helper
   - `isImageAccessible()` - Image accessibility check
   - `getImageDimensions()` - Get image dimensions

### Modified (1 file):
2. **`frontend/src/components/EventImage.tsx`**
   - Now uses `getImageUrl()` for URL normalization
   - Maintains all existing fallback behavior

### Documentation (1 file):
3. **`IMAGE_RENDERING_DEBUG_FIX.md`** (This file)

## 🎯 Summary

### What Was Fixed
1. ✅ Added URL normalization helper (`getImageUrl`)
2. ✅ Updated EventImage component to use helper
3. ✅ Verified entire image flow works end-to-end
4. ✅ Documented root cause and solution

### What Was Already Working
1. ✅ Backend static file serving
2. ✅ Frontend EventImage component with fallback
3. ✅ Image upload functionality
4. ✅ Event creation with images

### Why Images Weren't Showing
- **Root cause:** No events had `coverImageUrl` in database
- **Reason:** Existing events created before image feature
- **Solution:** Create new events using updated create event page

### Expected Behavior NOW
1. **New events with images:** Display cover image
2. **New events without images:** Display gradient fallback
3. **Old events:** Display gradient fallback (no coverImageUrl)
4. **Failed image loads:** Display gradient fallback (onError)

---

**Status:** ✅ System fully functional and debugged  
**Last Updated:** 2026-05-10  
**Image Rendering:** Working as designed
