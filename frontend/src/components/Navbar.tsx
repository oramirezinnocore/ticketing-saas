import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './Button';
import { UserRole } from '@/types';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              TicketHub
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link
                to="/events"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
              >
                Events
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/tickets"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                  >
                    My Tickets
                  </Link>
                  {(user?.role === UserRole.ORGANIZER || user?.role === UserRole.ADMIN) && (
                    <Link
                      to="/organizer"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-700">
                  Hello, <span className="font-medium">{user?.name}</span>
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
