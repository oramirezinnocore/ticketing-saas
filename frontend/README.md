# TicketHub Frontend

Production-ready React + TypeScript frontend for the Ticketing SaaS platform.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Routing
- **React Query** - Server state management
- **Zustand** - Client state management
- **Axios** - HTTP client

## Project Structure

```
src/
├── api/              # API client and service modules
│   ├── client.ts
│   ├── auth.ts
│   ├── events.ts
│   ├── orders.ts
│   ├── payments.ts
│   └── tickets.ts
├── components/       # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Container.tsx
│   └── Navbar.tsx
├── layouts/          # Layout components
│   └── MainLayout.tsx
├── pages/            # Page components
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── EventsPage.tsx
│   ├── EventDetailPage.tsx
│   ├── CheckoutPage.tsx
│   ├── TicketsPage.tsx
│   └── OrganizerDashboard.tsx
├── routes/           # Route protection
│   └── ProtectedRoute.tsx
├── store/            # Zustand stores
│   └── authStore.ts
├── types/            # TypeScript types
│   └── index.ts
├── App.tsx           # Main app component
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## Features

### ✅ Authentication
- Login/Register with JWT
- Persistent auth state (Zustand + localStorage)
- Auto token refresh
- Protected routes

### ✅ Public Event Listing
- Browse all events
- Responsive grid layout
- Event cards with key info
- Search and filter (ready for implementation)

### ✅ Event Detail Page
- Full event information
- Ticket type selection
- Quantity controls
- Real-time total calculation
- Responsive design

### ✅ Checkout Flow
- Order summary
- Payment integration (MercadoPago)
- Order expiration countdown
- Status tracking

### ✅ Ticket Wallet
- View purchased tickets
- Ticket status (valid/used)
- QR code display (ready for implementation)
- Ticket details

### ✅ Organizer Dashboard
- Role-based access
- Event management
- Analytics overview
- Create event (ready for implementation)

### ✅ Role-Based Route Protection
- Public routes (no auth required)
- Protected routes (auth required)
- Role-specific routes (organizer/admin only)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your backend URL
# VITE_API_URL=http://localhost:5000
```

### Development

```bash
# Start dev server
npm run dev

# Server runs on http://localhost:3000
```

### Build

```bash
# Type check
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### Clean Architecture Principles

1. **Separation of Concerns**
   - API layer separated from UI
   - Business logic in services
   - UI components are pure

2. **Component Reusability**
   - Atomic design principles
   - Composable components
   - Consistent prop interfaces

3. **Type Safety**
   - Full TypeScript coverage
   - Shared types between frontend/backend
   - Type-safe API calls

4. **State Management**
   - Server state: React Query
   - Client state: Zustand
   - Clear separation

### API Client

Centralized Axios instance with:
- Auto token injection
- Response transformation
- Error handling
- 401 redirect

```typescript
// Usage
import { eventsApi } from '@/api/events';

const events = await eventsApi.getAll();
```

### State Management

**Zustand** for auth state:
```typescript
const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
```

**React Query** for server state:
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['events'],
  queryFn: eventsApi.getAll,
});
```

### Route Protection

```typescript
<Route
  path="/tickets"
  element={
    <ProtectedRoute>
      <TicketsPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/organizer"
  element={
    <ProtectedRoute requiredRoles={[UserRole.ORGANIZER, UserRole.ADMIN]}>
      <OrganizerDashboard />
    </ProtectedRoute>
  }
/>
```

## Responsive Design

- Mobile-first approach
- Tailwind breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Flexible grid layouts
- Touch-friendly UI elements

## Component Library

### Button
```tsx
<Button variant="primary" size="md" isLoading={false}>
  Click Me
</Button>
```

### Input
```tsx
<Input
  label="Email"
  type="email"
  error="Invalid email"
  helpText="Enter your email"
/>
```

### Card
```tsx
<Card padding="md">
  <h2>Title</h2>
  <p>Content</p>
</Card>
```

### Container
```tsx
<Container size="lg">
  {/* Content */}
</Container>
```

## Environment Variables

```env
VITE_API_URL=http://localhost:5000
```

Access in code:
```typescript
import.meta.env.VITE_API_URL
```

## Deployment

### Vercel/Netlify

```bash
npm run build
# Deploy dist/ folder
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Future Enhancements

- [ ] QR code generation (qrcode.react)
- [ ] Event search and filtering
- [ ] User profile page
- [ ] Order history
- [ ] Event creation form (organizer)
- [ ] Event analytics dashboard
- [ ] Email notifications
- [ ] Social sharing
- [ ] Dark mode
- [ ] Internationalization (i18n)
- [ ] Progressive Web App (PWA)
- [ ] Accessibility improvements (WCAG 2.1)

## Testing

```bash
# Unit tests (to be added)
npm run test

# E2E tests (to be added)
npm run test:e2e
```

## Performance

- Code splitting via Vite
- Lazy loading routes
- Image optimization
- React Query caching
- Debounced inputs

## Security

- XSS protection (React escaping)
- CSRF protection via tokens
- Secure HTTP-only cookies
- Content Security Policy
- Input validation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow TypeScript strict mode
2. Use functional components + hooks
3. Write responsive, accessible code
4. Keep components small and focused
5. Use Tailwind utility classes
6. Type all props and state

## License

ISC
