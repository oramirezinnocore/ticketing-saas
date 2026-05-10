# Quick Reference - Event Images & Delete

## 🚀 Start Application

```bash
# Backend (Terminal 1)
cd backend && npm run dev

# Frontend (Terminal 2)
cd frontend && npm run dev
```

---

## 📸 Image Upload Flow

### 1. Upload Image
**Endpoint:** `POST /api/v1/upload/event-image`

```bash
curl -X POST http://localhost:5001/api/v1/upload/event-image \
  -H "Authorization: Bearer <TOKEN>" \
  -F "image=@poster.jpg"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "/uploads/events/1715270400000-abc.jpg"
  }
}
```

### 2. Create Event with Image

```bash
curl -X POST http://localhost:5001/api/v1/events \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Event",
    "description": "Event description",
    "date": "2026-06-15T10:00:00Z",
    "coverImageUrl": "/uploads/events/1715270400000-abc.jpg",
    "coverImageAlt": "My Event",
    "ticketTypes": [
      { "name": "General", "price": 100, "quantity": 200 }
    ]
  }'
```

### 3. View Image
**Direct URL:** `http://localhost:5001/uploads/events/1715270400000-abc.jpg`

---

## 🗑️ Delete Event Flow

### API Call

```bash
curl -X DELETE http://localhost:5001/api/v1/events/<event-id> \
  -H "Authorization: Bearer <TOKEN>"
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "message": "Event deleted successfully"
  }
}
```

### Frontend Steps
1. Login as organizer
2. Go to `/organizer/events`
3. Click "Eliminar" button
4. Confirm in modal
5. Event removed

---

## 🔑 Authorization Rules

| Action | Roles | Additional |
|--------|-------|-----------|
| Upload Image | Organizer, Admin | JWT required |
| View Image | Public | None |
| Delete Event | Organizer, Admin | Ownership check |

**Ownership:** Organizers can only delete their own events. Admins can delete any event.

---

## 🧪 Quick Tests

### Test Image Upload
```bash
# 1. Start servers
cd backend && npm run dev
cd frontend && npm run dev

# 2. Login: http://localhost:5173/login
Email: organizer@test.com
Password: Organizer123!

# 3. Create event: Panel de control → Crear evento
# 4. Upload image (drag-drop)
# 5. View at: http://localhost:5173/events
```

### Test Delete
```bash
# 1. Go to: http://localhost:5173/organizer/events
# 2. Click "Eliminar" on any event
# 3. Confirm deletion
# 4. Event disappears
```

### Verify Backend
```bash
# Check events
curl http://localhost:5001/api/v1/events | python3 -m json.tool

# Check uploaded files
ls -la backend/uploads/events/

# Test image access
curl -I http://localhost:5001/uploads/events/<filename>
```

---

## 📁 Key Files

### Backend
- `backend/src/modules/upload/upload.controller.ts` - Upload logic
- `backend/src/modules/events/event.service.ts` - Delete logic
- `backend/src/app.ts` - Static file serving

### Frontend
- `frontend/src/components/events/EventImageUploader.tsx` - Upload UI
- `frontend/src/components/EventImage.tsx` - Image rendering
- `frontend/src/components/DeleteEventModal.tsx` - Delete confirmation
- `frontend/src/utils/image.ts` - URL helper
- `frontend/src/pages/OrganizerEventsPage.tsx` - Event management

---

## 🐛 Common Issues

### Images Not Showing
```bash
# Check file exists
ls backend/uploads/events/

# Check database
curl http://localhost:5001/api/v1/events | grep coverImageUrl

# Check .env
cat frontend/.env  # Should have VITE_API_URL=http://localhost:5001
```

### Delete Button Missing
- Login as **organizer** (not attendee)
- Navigate to `/organizer/events` (not `/events`)
- Only shows on events you created

### 403 on Delete
- Verify you own the event (check organizerId)
- Verify JWT token is valid
- Check role is "organizer" or "admin"

---

## 📊 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/upload/event-image` | Yes | Upload image |
| GET | `/uploads/events/:filename` | No | View image |
| DELETE | `/api/v1/events/:id` | Yes | Delete event |
| GET | `/api/v1/events` | No | List events |
| POST | `/api/v1/events` | Yes | Create event |

---

## 🎯 Test Credentials

```javascript
// Organizer
{ email: "organizer@test.com", password: "Organizer123!" }

// Attendee  
{ email: "attendee@test.com", password: "Attendee123!" }
```

---

## ✅ Verification Checklist

- [ ] Backend running on port 5001
- [ ] Frontend running on port 5173
- [ ] Can upload image
- [ ] Image displays in events list
- [ ] Image displays in event detail
- [ ] Delete button visible for organizers
- [ ] Delete confirmation modal works
- [ ] Event removed after deletion
- [ ] Toast notifications appear
- [ ] No console errors

---

**For complete details, see:** `COMPLETE_IMAGE_AND_DELETE_IMPLEMENTATION.md`
