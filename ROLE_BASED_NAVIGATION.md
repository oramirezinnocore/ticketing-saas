# Role-Based Navigation & Routing - Complete Implementation

## ✅ IMPLEMENTATION COMPLETE

Role-aware navigation system that provides different user experiences based on user role.

---

## 🎯 User Experience by Role

### Regular Users (role: 'user')

**Navigation:**
- Eventos (public catalog)
- Mis Boletos

**Routes:**
- `/events` - Browse all events
- `/tickets` - View purchased tickets
- `/profile` - User profile

**After Login:** → `/events`

---

### Organizers (role: 'organizer')

**Navigation:**
- Dashboard
- Mis Eventos (organizer events management)
- Crear Evento
- Ver Catálogo (public events - secondary)

**Routes:**
- `/organizer` - Organizer dashboard with stats
- `/organizer/events` - Manage organizer's events
- `/organizer/events/create` - Create new event
- `/events` - View public catalog (as visitor)

**After Login:** → `/organizer`

---

### Admins (role: 'admin')

**Navigation:**
- Dashboard
- Eventos (all events management)
- Crear Evento
- Catálogo Público (public view - secondary)

**Routes:**
- `/organizer` - Admin dashboard (full access)
- `/organizer/events` - Manage all events
- `/organizer/events/create` - Create events for any organizer
- `/events` - View public catalog

**After Login:** → `/organizer`

---

## 📋 Files Changed

### 1. Navbar Component (Role-Aware Links)

**File:** `frontend/src/components/Navbar.tsx`

**Changes:**
- Created `getNavigationLinks()` function
- Different navigation for each role
- Shows user role badge in navbar
- Organizers don't see "Eventos" → see "Mis Eventos" instead

**Example Navigation:**

**Guest:**
```
TicketHub | Eventos
```

**User:**
```
TicketHub | Eventos | Mis Boletos
```

**Organizer:**
```
TicketHub | Dashboard | Mis Eventos | Crear Evento | Ver Catálogo
```

**Admin:**
```
TicketHub | Dashboard | Eventos | Crear Evento | Catálogo Público
```

---

### 2. Routing Utilities

**File:** `frontend/src/utils/routing.ts` (NEW)

**Functions:**

#### `getDashboardRoute(role)`
Returns default dashboard based on role:
- `admin` → `/organizer`
- `organizer` → `/organizer`
- `user` → `/events`

#### `getEventsRoute(role)`
Returns events route based on role:
- `admin` → `/organizer/events`
- `organizer` → `/organizer/events`
- `user` → `/events`

#### `isOrganizerRole(role)`
Check if user should see organizer navigation

#### `isAdminRole(role)`
Check if user should see admin navigation

---

### 3. LoginPage (Role-Aware Redirects)

**File:** `frontend/src/pages/LoginPage.tsx`

**Changes:**
- Imports `getDashboardRoute()`
- After successful login, redirects to role-specific dashboard
- Regular users → `/events`
- Organizers → `/organizer`
- Admins → `/organizer`

**Before:**
```typescript
// Everyone redirected to /events
navigate('/events', { replace: true });
```

**After:**
```typescript
// Role-aware redirect
const defaultRoute = getDashboardRoute(data.user.role);
navigate(defaultRoute, { replace: true });
```

---

## 🏗️ Routing Architecture

### Route Structure

```
Public Routes (No Auth Required)
├─ / (HomePage)
├─ /login
├─ /register
├─ /events (Public catalog)
└─ /events/:id (Event details)

User Routes (Auth Required, role: 'user')
├─ /tickets (User tickets)
├─ /checkout/:orderId
└─ /payment/* (Success/pending/failure)

Organizer Routes (Auth Required, role: 'organizer' | 'admin')
├─ /organizer (Dashboard)
├─ /organizer/events (Manage events)
└─ /organizer/events/create (Create event)

Admin Routes (Future)
├─ /admin
├─ /admin/users
└─ /admin/organizers
```

---

## 🔐 Protected Routes

### ProtectedRoute Component

**File:** `frontend/src/routes/ProtectedRoute.tsx`

**Usage:**
```typescript
<Route
  path="/organizer/events"
  element={
    <ProtectedRoute requiredRoles={[UserRole.ORGANIZER, UserRole.ADMIN]}>
      <OrganizerEventsPage />
    </ProtectedRoute>
  }
/>
```

**Behavior:**
1. Check if user is authenticated
2. If not → redirect to `/login` with return URL
3. If authenticated, check role
4. If wrong role → redirect to `/unauthorized`
5. If correct role → render component

---

## 🎨 Navbar Implementation

### Role-Aware Navigation Function

**File:** `frontend/src/components/Navbar.tsx`

```typescript
const getNavigationLinks = () => {
  if (!isAuthenticated) {
    // Guest navigation
    return <Link to="/events">Eventos</Link>;
  }

  if (user?.role === UserRole.USER) {
    // Regular user navigation
    return (
      <>
        <Link to="/events">Eventos</Link>
        <Link to="/tickets">Mis Boletos</Link>
      </>
    );
  }

  if (user?.role === UserRole.ORGANIZER) {
    // Organizer navigation
    return (
      <>
        <Link to="/organizer">Dashboard</Link>
        <Link to="/organizer/events">Mis Eventos</Link>
        <Link to="/organizer/events/create">Crear Evento</Link>
        <Link to="/events" className="text-gray-500">Ver Catálogo</Link>
      </>
    );
  }

  if (user?.role === UserRole.ADMIN) {
    // Admin navigation
    return (
      <>
        <Link to="/organizer">Dashboard</Link>
        <Link to="/organizer/events">Eventos</Link>
        <Link to="/organizer/events/create">Crear Evento</Link>
        <Link to="/events" className="text-gray-500">Catálogo Público</Link>
      </>
    );
  }
};
```

---

## 🔄 Login Flow

### Complete Login & Redirect Flow

```
1. User visits /login
   └─> Enters credentials

2. Login successful
   └─> Backend returns: { user, token }
   └─> Frontend calls: setAuth(user, token)

3. Auth store validates and persists
   └─> localStorage: auth-storage
   └─> localStorage: token

4. Role-based redirect
   └─> getDashboardRoute(user.role)
       ├─ admin → /organizer
       ├─ organizer → /organizer
       └─ user → /events

5. User lands on appropriate dashboard
   └─> Sees role-specific navigation
```

---

## 📊 Navigation Matrix

| User Type | After Login | "Eventos" Link | Primary Routes |
|-----------|-------------|----------------|----------------|
| **Guest** | N/A | `/events` (public catalog) | `/events`, `/login`, `/register` |
| **User** | `/events` | `/events` (public catalog) | `/events`, `/tickets` |
| **Organizer** | `/organizer` | `/organizer/events` (my events) | `/organizer`, `/organizer/events`, `/organizer/events/create` |
| **Admin** | `/organizer` | `/organizer/events` (all events) | `/organizer`, `/organizer/events`, `/admin/*` |

---

## 🚀 How It Works

### Example: Organizer Login

**1. Organizer logs in:**
```
Email: organizer@test.com
Password: Organizer123!
```

**2. Login response:**
```json
{
  "token": "eyJ...",
  "user": {
    "id": "69fec48e8e2d0e3e5166ec33",
    "email": "organizer@test.com",
    "name": "Test Organizer",
    "role": "organizer"
  }
}
```

**3. Redirect logic:**
```typescript
getDashboardRoute('organizer') // Returns: '/organizer'
navigate('/organizer', { replace: true });
```

**4. Organizer lands on:**
```
URL: http://localhost:3000/organizer

Navbar shows:
Dashboard | Mis Eventos | Crear Evento | Ver Catálogo

Page shows:
Organizer Dashboard with stats
```

**5. Organizer clicks "Mis Eventos":**
```
Navigate to: /organizer/events

Shows:
Only events where event.organizerId === user.id
Each event has "Eliminar" button
```

---

## 🔧 Benefits

### 1. Separation of Concerns
- Regular users focus on buying tickets
- Organizers focus on event management
- Admins have full system access

### 2. Intuitive Navigation
- Each role sees relevant links only
- No confusion about which "Events" page
- Clear distinction between public catalog and organizer panel

### 3. Security
- Protected routes enforce role requirements
- Backend validates all operations
- Frontend prevents accidental navigation to unauthorized pages

### 4. Scalability
- Easy to add new roles (e.g., "vendor", "staff")
- Role-aware utilities centralized
- Navigation logic isolated

---

## 🎯 Testing

### Test Regular User Experience

```bash
# 1. Login as user
Email: user@test.com
Password: User123!

# 2. Expected navbar:
Eventos | Mis Boletos

# 3. Expected after login:
Land on: /events (public catalog)

# 4. Expected routes:
✅ Can access: /events, /tickets
❌ Cannot access: /organizer/* (redirected to /unauthorized)
```

### Test Organizer Experience

```bash
# 1. Login as organizer
Email: organizer@test.com
Password: Organizer123!

# 2. Expected navbar:
Dashboard | Mis Eventos | Crear Evento | Ver Catálogo

# 3. Expected after login:
Land on: /organizer (dashboard)

# 4. Expected routes:
✅ Can access: /organizer, /organizer/events, /organizer/events/create
✅ Can access: /events (public catalog as visitor)
✅ Shows: Only their own events in /organizer/events
✅ Delete button: Visible for their events
```

### Test Admin Experience

```bash
# 1. Login as admin
Email: admin@test.com
Password: Admin123!

# 2. Expected navbar:
Dashboard | Eventos | Crear Evento | Catálogo Público

# 3. Expected after login:
Land on: /organizer (admin dashboard)

# 4. Expected routes:
✅ Can access: All organizer routes
✅ Can access: All user routes
✅ Shows: ALL events in /organizer/events
✅ Delete button: Visible for ALL events
```

---

## 📚 Summary

### What Changed

1. **Navbar** - Role-aware navigation links
2. **LoginPage** - Role-aware redirects after login
3. **Routing Utilities** - Centralized role-based route logic
4. **User Experience** - Different navigation for each role

### Key Features

- ✅ Organizers see "Mis Eventos" not "Eventos"
- ✅ Organizers land on `/organizer` after login
- ✅ Users land on `/events` after login
- ✅ Admins have full access
- ✅ Protected routes enforce role requirements
- ✅ Role badge visible in navbar

### Files Modified

1. `frontend/src/components/Navbar.tsx` - Role-aware navigation
2. `frontend/src/pages/LoginPage.tsx` - Role-aware redirects
3. `frontend/src/utils/routing.ts` - NEW file with route helpers

### Files Unchanged (Already Correct)

- `frontend/src/App.tsx` - Routing structure already good
- `frontend/src/routes/ProtectedRoute.tsx` - Already enforces roles
- `frontend/src/pages/OrganizerEventsPage.tsx` - Already filters by ownership
- `frontend/src/store/authStore.ts` - Already persists auth on refresh

---

**Status:** ✅ **COMPLETE**  
**Action Required:** Restart frontend to see role-based navigation

```bash
cd frontend
npm run dev
```

Then login as different roles to see different navigation!
