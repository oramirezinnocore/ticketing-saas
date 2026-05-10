# Event Cover Images - Quick Start Guide

## 🚀 Quick Start (5 Minutes)

### 1. Start Both Servers

```bash
# Terminal 1 - Backend
cd backend
npm install  # First time only
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm install  # First time only
npm run dev
```

**URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001
- Swagger Docs: http://localhost:5001/api/docs

### 2. Login as Organizer

Visit: http://localhost:5173/login

```
Email: organizer@test.com
Password: Organizer123!
```

### 3. Test Image Upload

**Option A: Using Swagger (API Testing)**

1. Go to: http://localhost:5001/api/docs
2. Click "Authorize" → Enter JWT token from login
3. Find `POST /api/v1/upload/event-image`
4. Click "Try it out"
5. Upload an image file
6. Execute
7. Copy the returned URL

**Option B: Using Frontend (Full Flow)**

1. Navigate to "Panel de control" (Dashboard)
2. Click "Crear evento" (Create Event)
3. See "Imagen de portada" section
4. Drag & drop an image OR click to select
5. Wait for upload (shows progress)
6. See preview
7. Fill other event details
8. Submit form

### 4. View Results

1. Go to "Eventos" page
2. See event cards with cover images
3. Click event to see hero banner

## 📁 Test Image Requirements

**Valid:**
- JPG, PNG, or WEBP format
- Max size: 5MB
- Any resolution (will be cropped to fit)

**Example Test Images:**
```bash
# Download free test images
curl -o test-event.jpg https://images.unsplash.com/photo-1540575467063-178a50c2df87
curl -o test-conference.jpg https://images.unsplash.com/photo-1505373877841-8d25f7d46678
```

## 🧪 Quick Tests

### Test 1: Upload Success
```bash
# Expected: Image preview appears
# Expected: No error messages
# Expected: URL stored in form
```

### Test 2: View Event Card
```bash
# Navigate to /events
# Expected: Cover image visible
# Expected: Gradient overlay
# Expected: Title readable over image
```

### Test 3: View Event Detail
```bash
# Click event card
# Expected: Large hero banner
# Expected: Full-width cover image
# Expected: Title + date over hero
```

### Test 4: Fallback Image
```bash
# Create event WITHOUT uploading image
# Expected: Gradient placeholder with calendar icon
# Expected: Event title visible on fallback
```

## 🔧 Troubleshooting

### Upload Not Working?

**Check 1: Authentication**
```bash
# Verify you're logged in as organizer
# Check browser console for 401/403 errors
```

**Check 2: File Type**
```bash
# Only JPG, PNG, WEBP allowed
# Check file extension
```

**Check 3: File Size**
```bash
# Max 5MB
# Compress image if needed
```

**Check 4: Backend Running**
```bash
# Backend must be running on port 5001
curl http://localhost:5001/health
# Should return: {"status": "ok"}
```

### Image Not Displaying?

**Check 1: URL Format**
```bash
# Should be: http://localhost:5001/uploads/events/[filename]
# Check browser Network tab
```

**Check 2: File Exists**
```bash
ls backend/uploads/events/
# Should see uploaded files
```

**Check 3: Static Serving**
```bash
# Open image URL directly in browser
# Should display image
```

### Fallback Always Showing?

**Check 1: Event Has URL**
```bash
# In event detail, check if coverImageUrl exists
# Should not be null/undefined
```

**Check 2: Image Load Error**
```bash
# Open browser console
# Check for CORS or 404 errors
```

## 📝 API Quick Reference

### Upload Image
```bash
POST /api/v1/upload/event-image
Auth: Bearer <token>
Body: multipart/form-data with "image" field

Response:
{
  "success": true,
  "data": {
    "url": "http://localhost:5001/uploads/events/xxx.jpg",
    "filename": "xxx.jpg",
    "originalName": "my-image.jpg",
    "mimetype": "image/jpeg",
    "size": 524288
  }
}
```

### Create Event with Image
```bash
POST /api/v1/events
Auth: Bearer <token>
Body: {
  "title": "My Event",
  "description": "Description",
  "date": "2026-06-15T10:00:00.000Z",
  "coverImageUrl": "http://localhost:5001/uploads/events/xxx.jpg",
  "coverImageAlt": "Event banner",
  "ticketTypes": [...]
}
```

### Access Image
```bash
GET /uploads/events/<filename>
# No auth required (public read)
```

## 🎨 UI Components Reference

### Use ImageUpload Component
```tsx
import { ImageUpload } from '@/components/ImageUpload';

<ImageUpload
  onImageUploaded={(url) => setValue('coverImageUrl', url)}
  currentImageUrl={watchedImageUrl}
  label="Imagen de portada"
  helpText="JPG, PNG o WEBP (máx. 5MB)"
/>
```

### Use EventImage Component
```tsx
import { EventImage } from '@/components/EventImage';

<EventImage
  src={event.coverImageUrl}
  alt={event.coverImageAlt}
  title={event.title}
  className="w-full h-48"
/>
```

### Use EventImageFallback Component
```tsx
import { EventImageFallback } from '@/components/EventImageFallback';

<EventImageFallback
  title={event.title}
  className="w-full h-48"
/>
```

## 📊 What's Changed

### Backend
- ✅ Events support `coverImageUrl` and `coverImageAlt`
- ✅ Upload endpoint at `/api/v1/upload/event-image`
- ✅ Files saved to `backend/uploads/events/`
- ✅ Static serving at `/uploads/events/<filename>`

### Frontend
- ✅ Drag & drop image upload component
- ✅ Event cards show cover images
- ✅ Event detail has hero banner
- ✅ Gradient fallback for events without images

## 🎯 Next Steps

1. **Try it yourself:**
   - Upload an image
   - Create an event
   - View the results

2. **Customize:**
   - Change gradient colors in EventImageFallback
   - Adjust image sizes (h-48, h-96)
   - Modify upload size limits

3. **Production:**
   - Set up cloud storage (S3/Cloudinary)
   - Configure image optimization
   - Add image cropping tool

## 📖 Full Documentation

See `EVENT_IMAGES_IMPLEMENTATION.md` for:
- Complete architecture details
- Security measures
- All API endpoints
- Testing procedures
- Future enhancements

---

**Need Help?** Check the troubleshooting section above or see the full documentation.
