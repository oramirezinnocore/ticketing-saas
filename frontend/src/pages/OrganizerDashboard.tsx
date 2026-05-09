import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/api/events';
import { useAuth } from '@/hooks/useAuth';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export const OrganizerDashboard = () => {
  const { user } = useAuth();

  const {
    data: events = [],
    isLoading,
  } = useQuery({
    queryKey: ['events'],
    queryFn: eventsApi.getAll,
  });

  // Filter events created by current organizer
  const organizerEvents = events.filter((event) => event.organizerId === user?.id);

  // Calculate stats
  const totalEvents = organizerEvents.length;

  const totalTicketsSold = organizerEvents.reduce((sum, event) => {
    return (
      sum +
      event.ticketTypes.reduce((eventSum, type) => {
        return eventSum + (type.quantity - type.quantityAvailable);
      }, 0)
    );
  }, 0);

  const totalRevenue = organizerEvents.reduce((sum, event) => {
    return (
      sum +
      event.ticketTypes.reduce((eventSum, type) => {
        const soldTickets = type.quantity - type.quantityAvailable;
        return eventSum + soldTickets * type.price;
      }, 0)
    );
  }, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Container>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
        </div>
        <Link to="/organizer/events/create">
          <Button>Create Event</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Total Events</h3>
              <p className="text-3xl font-bold">
                {isLoading ? '...' : totalEvents}
              </p>
            </div>
            <div className="bg-primary-100 rounded-full p-3">
              <svg
                className="w-6 h-6 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Tickets Sold</h3>
              <p className="text-3xl font-bold">
                {isLoading ? '...' : totalTicketsSold}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Revenue</h3>
              <p className="text-3xl font-bold">
                {isLoading ? '...' : `$${totalRevenue.toFixed(2)}`}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your Recent Events</h2>
          <Link to="/organizer/events">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        {isLoading && (
          <div className="text-center py-8 text-gray-500">Loading your events...</div>
        )}

        {!isLoading && organizerEvents.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first event.
            </p>
            <div className="mt-6">
              <Link to="/organizer/events/create">
                <Button>Create Event</Button>
              </Link>
            </div>
          </div>
        )}

        {!isLoading && organizerEvents.length > 0 && (
          <div className="space-y-4">
            {organizerEvents.slice(0, 5).map((event) => {
              const totalTickets = event.ticketTypes.reduce(
                (sum, type) => sum + type.quantity,
                0
              );
              const availableTickets = event.ticketTypes.reduce(
                (sum, type) => sum + type.quantityAvailable,
                0
              );
              const soldTickets = totalTickets - availableTickets;

              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(event.date)}</p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="text-sm font-medium text-gray-900">
                      {soldTickets} / {totalTickets} sold
                    </p>
                    <p className="text-xs text-gray-500">
                      {totalTickets > 0
                        ? `${Math.round((soldTickets / totalTickets) * 100)}% full`
                        : '0%'}
                    </p>
                  </div>
                  <Link to={`/events/${event.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </Container>
  );
};
