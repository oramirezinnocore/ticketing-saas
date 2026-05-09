import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { TicketsPage } from './pages/TicketsPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { PaymentPendingPage } from './pages/PaymentPendingPage';
import { PaymentFailurePage } from './pages/PaymentFailurePage';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { UserRole } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />

            {/* Checkout & Payment Routes */}
            <Route
              path="/checkout/:orderId"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payment/success"
              element={
                <ProtectedRoute>
                  <PaymentSuccessPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payment/pending"
              element={
                <ProtectedRoute>
                  <PaymentPendingPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payment/failure"
              element={
                <ProtectedRoute>
                  <PaymentFailurePage />
                </ProtectedRoute>
              }
            />

            {/* User Tickets */}
            <Route
              path="/tickets"
              element={
                <ProtectedRoute>
                  <TicketsPage />
                </ProtectedRoute>
              }
            />

            {/* Organizer Routes */}
            <Route
              path="/organizer"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ORGANIZER, UserRole.ADMIN]}>
                  <OrganizerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
