import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './Button';
import { UserRole } from '@/types';
import { commonTexts } from '@/i18n';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  // Role-aware navigation links
  const getNavigationLinks = () => {
    if (!isAuthenticated) {
      // Guest/public navigation
      return (
        <Link
          to="/events"
          className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
        >
          {commonTexts.nav.events}
        </Link>
      );
    }

    // User navigation (regular user)
    if (user?.role === UserRole.USER) {
      return (
        <>
          <Link
            to="/events"
            className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
          >
            {commonTexts.nav.events}
          </Link>
          <Link
            to="/tickets"
            className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
          >
            {commonTexts.nav.myTickets}
          </Link>
        </>
      );
    }

    // Organizer navigation
    if (user?.role === UserRole.ORGANIZER) {
      return (
        <>
          <Link
            to="/organizer"
            className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
          >
            Dashboard
          </Link>
          <Link
            to="/organizer/events"
            className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
          >
            Mis Eventos
          </Link>
          <Link
            to="/organizer/events/create"
            className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
          >
            Crear Evento
          </Link>
          <Link
            to="/events"
            className="text-gray-500 hover:text-primary-600 px-3 py-2 text-sm font-medium"
          >
            Ver Catálogo
          </Link>
        </>
      );
    }

    // Admin navigation
    if (user?.role === UserRole.ADMIN) {
      return (
        <>
          <Link
            to="/organizer"
            className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
          >
            Dashboard
          </Link>
          <Link
            to="/organizer/events"
            className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
          >
            Eventos
          </Link>
          <Link
            to="/organizer/events/create"
            className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
          >
            Crear Evento
          </Link>
          <Link
            to="/events"
            className="text-gray-500 hover:text-primary-600 px-3 py-2 text-sm font-medium"
          >
            Catálogo Público
          </Link>
        </>
      );
    }

    return null;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              TicketHub
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {getNavigationLinks()}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-700">
                  {commonTexts.nav.hello}, <span className="font-medium">{user?.name}</span>
                  <span className="ml-2 text-xs text-gray-500">({user?.role})</span>
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  {commonTexts.nav.logout}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    {commonTexts.nav.login}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">{commonTexts.nav.register}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
