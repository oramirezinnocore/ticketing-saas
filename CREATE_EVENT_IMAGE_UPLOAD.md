# Create Event Page - Image Upload Integration

## 📋 Overview

This document describes the **complete image upload integration** in the event creation page. Organizers can now upload professional cover images when creating events using an intuitive drag-and-drop interface.

## ✅ Problem Fixed

**Before:**
- CreateEventPage had **NO image upload UI**
- Backend upload feature existed but was **not integrated**
- Organizers had no way to add cover images to events
- Form had no image fields

**After:**
- ✅ Full drag-and-drop image uploader integrated
- ✅ Professional UI with preview
- ✅ Upload progress indication
- ✅ Image validation and error handling
- ✅ Spanish language support
- ✅ Modern, polished UX

## 🎯 What Was Implemented

### 1. Validation Schema Extension

**File:** `frontend/src/lib/validations.ts`

**Changes:**
```typescript
export const createEventSchema = z.object({
  title: z.string()...,
  description: z.string()...,
  date: z.string()...,
  // NEW FIELDS:
  coverImageUrl: z.string().optional(),
  coverImageAlt: z.string().max(200, '...').optional(),
  ticketTypes: z.array(...)...,
});
```

### 2. EventImageUploader Component

**File:** `frontend/src/components/events/EventImageUploader.tsx` (NEW)

**Features:**
- ✅ Drag and drop support
- ✅ Click to select file
- ✅ Real-time preview
- ✅ Upload progress spinner
- ✅ Success feedback with checkmark
- ✅ Change/remove image buttons
- ✅ Client-side validation (type, size)
- ✅ Error messages in Spanish
- ✅ Hover effects and animations
- ✅ Disabled state during submission
- ✅ Professional gradient overlays
- ✅ Helpful tips for users

**Props:**
```typescript
interface EventImageUploaderProps {
  onImageUploaded: (url: string) => void;
  onImageRemoved?: () => void;
  currentImageUrl?: string;
  disabled?: boolean;
}
```

**Validation Rules:**
- **Allowed types:** JPG, PNG, WEBP
- **Max size:** 5MB
- **Recommended resolution:** 1920x1080px or higher

### 3. CreateEventPage Integration

**File:** `frontend/src/pages/CreateEventPage.tsx`

**Changes:**
1. Imported EventImageUploader component
2. Added `setValue` and `watch` from react-hook-form
3. Added form fields for coverImageUrl and coverImageAlt
4. Integrated uploader between date field and ticket types
5. Auto-populates coverImageAlt with event title
6. All labels translated to Spanish
7. Disabled state during form submission

**Form Flow:**
```
1. User drags/selects image
2. Component validates file (type, size)
3. Creates preview immediately
4. Uploads to backend (POST /api/v1/upload/event-image)
5. Backend returns image URL
6. Component calls onImageUploaded(url)
7. URL stored in form state via setValue
8. coverImageAlt auto-filled with event title
9. Form submission includes coverImageUrl
```

## 🎨 UI/UX Improvements

### Upload State
```
┌─────────────────────────────────────────┐
│   📷                                     │
│   Arrastra una imagen aquí o            │
│   haz clic para seleccionar             │
│                                          │
│   JPG, PNG o WEBP (máx. 5MB)           │
│   Recomendado: 1920x1080px o superior   │
└─────────────────────────────────────────┘
```

### Uploading State
```
┌─────────────────────────────────────────┐
│           ⟳ (spinning)                   │
│      Subiendo imagen...                  │
│      Por favor espera                    │
└─────────────────────────────────────────┘
```

### Preview State
```
┌─────────────────────────────────────────┐
│   [Cover Image Preview]           ✓     │
│                                          │
│   [Cambiar imagen] [Eliminar]    │← On hover
└─────────────────────────────────────────┘
```

### Drag Over State
```
┌─────────────────────────────────────────┐
│   📷 (highlighted)                       │
│   ¡Suelta la imagen aquí!               │
│                                          │
│   (Border: primary-500, Background: primary-50)
└─────────────────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────────────┐
│ ⚠ Error al subir imagen                 │
│ El archivo es demasiado grande.          │
│ El tamaño máximo es 5MB.                 │
└─────────────────────────────────────────┘
```

## 🔄 Upload Flow Diagram

```
┌──────────────┐
│   Organizer  │
│  selects/    │
│  drags image │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Client-side          │
│ Validation           │
│ - Type (JPG/PNG/WEBP)│
│ - Size (< 5MB)       │
└──────┬───────────────┘
       │ Valid
       ▼
┌──────────────────────┐
│ Create Preview       │
│ FileReader.readAsDataURL()
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Upload to Backend    │
│ POST /api/v1/upload/ │
│      event-image     │
│ (multipart/form-data)│
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Backend Processes    │
│ - Validates file     │
│ - Sanitizes filename │
│ - Saves to disk      │
│ - Returns public URL │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ onImageUploaded(url) │
│ - setValue('coverImageUrl', url)
│ - setValue('coverImageAlt', title)
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Form Submission      │
│ includes coverImageUrl
└──────────────────────┘
```

## 🌐 API Integration

### Upload Endpoint

**POST** `/api/v1/upload/event-image`

**Request:**
```http
POST /api/v1/upload/event-image HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="image"; filename="event.jpg"
Content-Type: image/jpeg

<binary data>
--boundary--
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "url": "http://localhost:5001/uploads/events/1715270400000-a1b2c3d4.jpg",
    "filename": "1715270400000-a1b2c3d4.jpg",
    "originalName": "event.jpg",
    "mimetype": "image/jpeg",
    "size": 524288
  }
}
```

**Response (Error - Invalid Type):**
```json
{
  "success": false,
  "message": "Invalid file type. Allowed types: image/jpeg, image/png, image/webp"
}
```

**Response (Error - Too Large):**
```json
{
  "success": false,
  "message": "File too large"
}
```

### Create Event with Image

**POST** `/api/v1/events`

```json
{
  "title": "Conferencia Tech 2026",
  "description": "Una conferencia increíble...",
  "date": "2026-06-15T10:00:00.000Z",
  "coverImageUrl": "http://localhost:5001/uploads/events/1715270400000-abc.jpg",
  "coverImageAlt": "Conferencia Tech 2026",
  "ticketTypes": [
    {
      "name": "Entrada general",
      "price": 250,
      "quantity": 100
    }
  ]
}
```

## 🔒 Validation Behavior

### Client-Side Validation

**Before Upload:**
```typescript
// Type validation
const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!validTypes.includes(file.type)) {
  setUploadError('Tipo de archivo inválido...');
  return;
}

// Size validation
const maxSize = 5 * 1024 * 1024; // 5MB
if (file.size > maxSize) {
  setUploadError('El archivo es demasiado grande...');
  return;
}
```

**Error Messages (Spanish):**
- `"Tipo de archivo inválido. Solo se permiten JPG, PNG o WEBP."`
- `"El archivo es demasiado grande. El tamaño máximo es 5MB."`
- `"Error al subir la imagen. Intenta de nuevo."`

### Server-Side Validation

Handled by multer configuration:
- MIME type validation
- Extension validation
- File size limit
- Filename sanitization
- Path traversal protection

### Form Validation

Image fields are **optional** - event can be created without cover image:
```typescript
coverImageUrl: z.string().optional(),
coverImageAlt: z.string().max(200, '...').optional(),
```

## 🎨 Spanish Translations

All UI text is in Spanish (Mexico):

```typescript
// Upload component
"Imagen de portada"
"(Opcional)"
"Arrastra una imagen aquí o haz clic para seleccionar"
"JPG, PNG o WEBP (máx. 5MB)"
"Recomendado: 1920x1080px o superior"
"¡Suelta la imagen aquí!"
"Subiendo imagen..."
"Por favor espera"
"Cambiar imagen"
"Eliminar"
"Imagen subida"
"Error al subir imagen"
"💡 Tip: Una buena imagen de portada mejora la visibilidad..."

// Create event page
"Crear nuevo evento"
"Volver al panel"
"Detalles del evento"
"Título del evento"
"Descripción"
"Fecha y hora del evento"
"Tipos de boleto"
"+ Agregar tipo de boleto"
"Nombre del boleto"
"Precio ($)"
"Cantidad"
"Cancelar"
"Crear evento"
```

## 📂 Files Changed

### Created (1 file):
1. **`frontend/src/components/events/EventImageUploader.tsx`** (272 lines)
   - Complete drag-and-drop uploader
   - Professional UI with animations
   - Spanish language support
   - All validation and error handling

### Modified (3 files):
2. **`frontend/src/lib/validations.ts`**
   - Added coverImageUrl and coverImageAlt to schema
   - Both fields optional

3. **`frontend/src/pages/CreateEventPage.tsx`**
   - Imported EventImageUploader
   - Added setValue and watch hooks
   - Integrated uploader in form
   - All labels translated to Spanish
   - Auto-populate alt text with title

4. **`frontend/src/i18n/events.ts`**
   - Added submitButton text

## 🚀 Testing Guide

### Manual Testing Steps

**1. Start Servers**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

**2. Login as Organizer**
```
URL: http://localhost:5173/login
Email: organizer@test.com
Password: Organizer123!
```

**3. Navigate to Create Event**
```
Click: "Panel de control"
Click: "Crear evento"
```

**4. Test Image Upload**

**Test A: Drag and Drop**
- Drag an image file over the upload area
- Verify border turns blue and shows "¡Suelta la imagen aquí!"
- Drop the image
- Verify upload spinner appears
- Verify preview shows after upload
- Verify "Imagen subida" badge appears

**Test B: Click to Select**
- Click the upload area
- Select an image from file picker
- Verify same upload flow

**Test C: Invalid File Type**
- Try uploading a PDF or GIF
- Verify error message: "Tipo de archivo inválido..."

**Test D: File Too Large**
- Try uploading image > 5MB
- Verify error message: "El archivo es demasiado grande..."

**Test E: Change Image**
- Upload an image
- Hover over preview
- Click "Cambiar imagen"
- Select different image
- Verify new image replaces old one

**Test F: Remove Image**
- Upload an image
- Hover over preview
- Click "Eliminar"
- Verify image removed
- Verify upload area reappears

**Test G: Complete Event Creation**
- Upload an image
- Fill all required fields:
  - Title: "Mi Evento de Prueba"
  - Description: "Descripción del evento"
  - Date: Select future date
  - Ticket type: "General", $100, 50 quantity
- Click "Crear evento"
- Verify redirect to dashboard
- Verify event appears with cover image

### Test Cases Checklist

- [ ] Drag and drop works
- [ ] Click to select works
- [ ] JPG upload succeeds
- [ ] PNG upload succeeds
- [ ] WEBP upload succeeds
- [ ] GIF rejected with error
- [ ] PDF rejected with error
- [ ] File > 5MB rejected with error
- [ ] Upload progress shows spinner
- [ ] Preview displays correctly
- [ ] Success badge appears
- [ ] Change image button works
- [ ] Remove image button works
- [ ] Hover effects work
- [ ] Component disabled during form submission
- [ ] Event created with coverImageUrl
- [ ] Event created without image (optional)
- [ ] All text in Spanish
- [ ] Error messages in Spanish
- [ ] Mobile responsive

## 🎯 UX Improvements Implemented

### Visual Feedback
✅ **Drag Over State:** Border color changes, background highlights
✅ **Upload Progress:** Spinning loader with text
✅ **Success Indicator:** Green badge with checkmark
✅ **Hover Effects:** Button overlay on preview
✅ **Error Display:** Red alert box with icon

### Animations
✅ **Spinner:** Smooth rotation animation
✅ **Scale Effect:** Upload area scales up on drag over
✅ **Fade Transitions:** Smooth opacity changes
✅ **Gradient Overlay:** Smooth appearance on hover

### User Guidance
✅ **Helpful Tip:** Information about image importance
✅ **Format Guidance:** Clear file type requirements
✅ **Size Guidance:** Clear file size limits
✅ **Resolution Recommendation:** Suggested image dimensions
✅ **Optional Badge:** Clear indication that image is optional

### Accessibility
✅ **Keyboard Support:** File input accessible via keyboard
✅ **Disabled States:** Clear visual indication
✅ **Error Messages:** Screen reader friendly
✅ **Alt Text:** Auto-populated from event title

## 🐛 Debugging Checklist

### If Image Upload Not Visible

**Check 1: Component Import**
```typescript
// In CreateEventPage.tsx
import { EventImageUploader } from '@/components/events/EventImageUploader';
```

**Check 2: Component Rendering**
```typescript
// Should be between date and ticket types
<EventImageUploader
  onImageUploaded={...}
  currentImageUrl={watchedImageUrl}
  disabled={...}
/>
```

**Check 3: Form State**
```typescript
// Watch hook should be present
const watchedImageUrl = watch('coverImageUrl');
```

**Check 4: CSS/Layout**
- Check browser console for CSS errors
- Verify no z-index issues
- Check if parent container has overflow:hidden

### If Upload Fails

**Check 1: Backend Running**
```bash
curl http://localhost:5001/health
# Should return: {"status": "ok", ...}
```

**Check 2: Authentication**
```bash
# Check localStorage has token
localStorage.getItem('token')
```

**Check 3: Network Tab**
- Open browser DevTools → Network
- Upload image
- Check POST request to `/api/v1/upload/event-image`
- Verify 201 response

**Check 4: File Size**
```bash
# Check file size
ls -lh image.jpg
# Should be < 5MB
```

## 📊 Performance Considerations

### Client-Side
- **Preview Generation:** Uses FileReader (async, non-blocking)
- **Image Display:** Uses `object-fit: cover` (GPU accelerated)
- **Upload Progress:** Shows spinner immediately (perceived performance)

### Network
- **Upload Size:** Controlled by 5MB limit
- **FormData:** Efficient multipart upload
- **Single Request:** No chunking needed for files < 5MB

### Server-Side
- **Multer:** Efficient stream-based file handling
- **Disk Storage:** Fast local filesystem write
- **Unique Filenames:** Crypto-based (minimal overhead)

## 🔮 Future Enhancements

### Phase 2
- [ ] Image cropping tool
- [ ] Multiple image upload (gallery)
- [ ] Image compression before upload
- [ ] Progress percentage indicator
- [ ] Retry failed uploads

### Phase 3
- [ ] Cloud storage migration (S3/Cloudinary)
- [ ] CDN integration
- [ ] Image optimization (auto-resize)
- [ ] Thumbnail generation
- [ ] Stock image integration

## 📚 Related Documentation

- `EVENT_IMAGES_IMPLEMENTATION.md` - Complete backend/frontend image system
- `QUICK_START_IMAGES.md` - Quick setup guide
- `SPANISH_LOCALIZATION.md` - Spanish translation system

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-10  
**Status**: Complete ✅  
**Integration**: Fully Working ✅
