import { UserRole } from '@/types';

/**
 * Get the default dashboard route based on user role
 */
export const getDashboardRoute = (role?: UserRole | string): string => {
  switch (role) {
    case UserRole.ADMIN:
      return '/organizer'; // Admins use organizer dashboard with full access
    case UserRole.ORGANIZER:
      return '/organizer'; // Organizers go to their dashboard
    case UserRole.USER:
    default:
      return '/events'; // Regular users go to public events catalog
  }
};

/**
 * Get the events route based on user role
 */
export const getEventsRoute = (role?: UserRole | string): string => {
  switch (role) {
    case UserRole.ADMIN:
    case UserRole.ORGANIZER:
      return '/organizer/events'; // Organizers/admins see their events
    case UserRole.USER:
    default:
      return '/events'; // Regular users see public catalog
  }
};

/**
 * Check if user should see organizer navigation
 */
export const isOrganizerRole = (role?: UserRole | string): boolean => {
  return role === UserRole.ORGANIZER || role === UserRole.ADMIN;
};

/**
 * Check if user should see admin navigation
 */
export const isAdminRole = (role?: UserRole | string): boolean => {
  return role === UserRole.ADMIN;
};
