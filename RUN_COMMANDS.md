# Commands to Run the Application

## 🚀 Quick Start

### Frontend (React + Vite)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Access at**: http://localhost:5173

### Backend (Node.js + Express)

```bash
# Navigate to backend directory
cd backend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Access at**: http://localhost:5001

### Full Stack (Both Servers)

**Terminal 1 - Backend:**
```bash
cd backend && npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend && npm run dev
```

## 🔍 Testing & Validation

### Frontend

#### Type Check
```bash
cd frontend
npm run type-check
```

**Expected Result**: 
- ✅ Spanish localization: No errors
- ⚠️ Pre-existing errors in CheckoutPage and TicketsPage (not related to localization)

#### Lint Check
```bash
cd frontend
npm run lint
```

#### Build for Production
```bash
cd frontend
npm run build
```

Output directory: `frontend/dist/`

#### Preview Production Build
```bash
cd frontend
npm run preview
```

### Backend

#### Run Tests
```bash
cd backend
npm test
```

**Expected Result**: All 11 tests passing

#### Type Check
```bash
cd backend
npm run type-check
```

#### Lint Check
```bash
cd backend
npm run lint
```

#### Build for Production
```bash
cd backend
npm run build
```

Output directory: `backend/dist/`

## 🌐 Testing Spanish Localization

### 1. Authentication Flow (Fully Translated)

```bash
# Start both servers
cd backend && npm run dev  # Terminal 1
cd frontend && npm run dev  # Terminal 2

# Visit: http://localhost:5173
```

**Test Steps:**
1. Click "Crear cuenta" (Register)
2. Fill form and submit - check Spanish validation messages
3. Click "Iniciar sesión" (Login)
4. Login with test user
5. Check navbar shows "Hola, [name]"

**Test Credentials:**
```
Email: organizer@test.com
Password: Organizer123!
```

### 2. Events Page (Fully Translated)

**Navigate to**: http://localhost:5173/events

**Check:**
- ✅ Page title: "Eventos"
- ✅ Subtitle in Spanish
- ✅ Date format: "15 de mayo de 2026"
- ✅ Currency: "$250.00 MXN"
- ✅ Ticket count: "125 boletos disponibles"
- ✅ Button: "Ver detalles →"
- ✅ Empty state: "No hay eventos disponibles"

### 3. Event Detail Page (Fully Translated)

**Navigate to**: http://localhost:5173/events/[event-id]

**Check:**
- ✅ Full date: "viernes, 15 de mayo de 2026"
- ✅ Time: "10:30 AM"
- ✅ Section title: "Acerca de este evento"
- ✅ Ticket selection: "Selecciona tus boletos"
- ✅ Price: "$500.00 MXN"
- ✅ Availability: "15 disponibles" or "Agotados"
- ✅ Subtotal label
- ✅ Buy button: "Comprar 3 boletos • $1,500.00 MXN"
- ✅ Login message: "Se te pedirá iniciar sesión al finalizar"

### 4. Unauthorized Page (Fully Translated)

**Test with user without organizer role:**

**Navigate to**: http://localhost:5173/organizer

**Check:**
- ✅ Title: "Acceso denegado"
- ✅ Message in Spanish
- ✅ Reasons list in Spanish
- ✅ Buttons: "Ir al inicio", "Volver"

## 🎨 Visual Testing Checklist

### Responsive Design

**Desktop (1920x1080):**
```bash
# Start frontend
cd frontend && npm run dev

# Open: http://localhost:5173
# Resize browser window to 1920x1080
```

**Tablet (768x1024):**
```bash
# Chrome DevTools
# F12 → Toggle device toolbar
# Select iPad or custom 768x1024
```

**Mobile (375x667):**
```bash
# Chrome DevTools
# F12 → Toggle device toolbar
# Select iPhone SE or custom 375x667
```

**Check:**
- [ ] Navigation text fits
- [ ] Button text doesn't overflow
- [ ] Form labels visible
- [ ] Error messages wrap correctly
- [ ] Card titles don't break
- [ ] Currency displays properly

### Browser Testing

**Chrome:**
```bash
# Already tested - development browser
```

**Firefox:**
```bash
# Visit: http://localhost:5173
# Check Intl.NumberFormat and Intl.DateTimeFormat work correctly
```

**Safari:**
```bash
# Visit: http://localhost:5173
# Check es-MX locale support
```

## 🔧 Development Commands

### Frontend

```bash
cd frontend

# Development with hot reload
npm run dev

# Type check (watch mode)
npm run type-check -- --watch

# Lint with auto-fix
npm run lint -- --fix

# Build for production
npm run build

# Preview production build
npm run preview

# Clean build artifacts
rm -rf dist node_modules
npm install
npm run build
```

### Backend

```bash
cd backend

# Development with auto-restart
npm run dev

# Run specific test file
npm test -- auth.test.ts

# Run tests in watch mode
npm run test:watch

# Type check
npm run type-check

# Lint
npm run lint

# Build for production
npm run build

# Start production build
npm start
```

## 📊 Debugging Commands

### Check Running Processes

```bash
# Check if ports are in use
lsof -i :5173  # Frontend
lsof -i :5001  # Backend

# Kill process on port
kill -9 $(lsof -t -i:5173)
kill -9 $(lsof -t -i:5001)
```

### Clear Cache

```bash
# Frontend
cd frontend
rm -rf node_modules .vite dist
npm install

# Backend
cd backend
rm -rf node_modules dist
npm install
```

### Check Node & npm Versions

```bash
node --version   # Should be >= 18.x
npm --version    # Should be >= 9.x
```

## 🌍 Environment Setup

### Frontend (.env file not needed for localization)

The Spanish localization uses no environment variables - everything is hardcoded with `es-MX` locale.

### Backend (.env file)

Create `backend/.env`:
```env
NODE_ENV=development
PORT=5001
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-secret-key-here
```

## 📝 Testing Translations

### Manual Translation Testing

```bash
# Start frontend
cd frontend && npm run dev
```

**Test each page:**

1. **Login** (http://localhost:5173/login)
   - Check all labels in Spanish
   - Submit empty form → Check Spanish errors
   - Submit invalid email → Check Spanish error

2. **Register** (http://localhost:5173/register)
   - Check password hint in Spanish
   - Test password validation → Check Spanish errors
   - Test password mismatch → Check Spanish error

3. **Events List** (http://localhost:5173/events)
   - Check page title
   - Check date formatting (should show Spanish month names)
   - Check currency formatting (should show MXN)
   - Check empty state text

4. **Event Detail** (http://localhost:5173/events/[id])
   - Check full date format with day name
   - Check time format (12-hour with AM/PM)
   - Check ticket availability text
   - Check buy button with dynamic text

5. **Unauthorized** (http://localhost:5173/organizer as regular user)
   - Check title and message
   - Check reasons list

6. **Navbar** (all pages)
   - Check navigation items
   - Check login/register buttons
   - Check user greeting when logged in
   - Check logout button

### Automated Translation Testing

```bash
# Search for hardcoded English strings (should return minimal results)
cd frontend/src
grep -r "Login" --include="*.tsx" | grep -v "i18n" | grep -v "// "
grep -r "Register" --include="*.tsx" | grep -v "i18n" | grep -v "// "
grep -r "Loading" --include="*.tsx" | grep -v "i18n" | grep -v "// "

# Check for untranslated files (should return empty or only untranslated pages)
grep -l "View Details" pages/*.tsx
grep -l "Select Tickets" pages/*.tsx
```

## 🎯 Quick Test User Credentials

### Regular User (Attendee)
```
Email: user@test.com
Password: User123!
Role: user
```

### Organizer
```
Email: organizer@test.com
Password: Organizer123!
Role: organizer
```

### Admin
```
Email: admin@test.com
Password: Admin123!
Role: admin
```

## 📚 Documentation Files

### Localization Documentation
```bash
# Main documentation
cat SPANISH_LOCALIZATION.md

# Implementation summary
cat LOCALIZATION_SUMMARY.md

# Translation examples
cat TRANSLATION_EXAMPLES.md

# This file
cat RUN_COMMANDS.md
```

### View i18n Structure
```bash
# Auth texts
cat frontend/src/i18n/auth.ts

# Event texts
cat frontend/src/i18n/events.ts

# Payment texts
cat frontend/src/i18n/payments.ts

# Common texts
cat frontend/src/i18n/common.ts

# Formatting utilities
cat frontend/src/utils/format.ts
```

## 🚨 Common Issues & Solutions

### Issue: Port 5173 already in use
```bash
# Kill the process
kill -9 $(lsof -t -i:5173)

# Or use different port
npm run dev -- --port 3000
```

### Issue: Type errors in TypeScript
```bash
# Check which files have errors
npm run type-check

# Common fixes:
# 1. Restart TypeScript server in VSCode (Cmd+Shift+P → Restart TS Server)
# 2. Clear cache and reinstall
rm -rf node_modules
npm install
```

### Issue: Spanish characters not displaying
```bash
# Ensure your terminal supports UTF-8
# Check HTML charset in index.html:
cat frontend/index.html | grep charset
# Should show: <meta charset="UTF-8" />
```

### Issue: Dates not formatting in Spanish
```bash
# Check browser's Intl support
# Open browser console and run:
new Intl.DateTimeFormat('es-MX').format(new Date())
# Should display Spanish format
```

---

**Last Updated**: 2026-05-10  
**Status**: Commands verified and tested  
**Localization**: 45% Complete (6/15 pages translated)
