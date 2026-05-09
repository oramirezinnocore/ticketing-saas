import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { eventsApi } from '@/api/events';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { format } from 'date-fns';

export const EventsPage = () => {
  const { data: events, isLoading, isError } = useQuery({
    queryKey: ['events'],
    queryFn: eventsApi.getAll,
  });

  if (isLoading) {
    return (
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} padding="none" className="overflow-hidden animate-pulse">
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-9 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container className="py-12">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Failed to load events</div>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Upcoming Events</h1>
        <p className="text-gray-600">Discover amazing experiences and book your tickets</p>
      </div>

      {events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const minPrice = Math.min(...event.ticketTypes.map((t) => t.price));
            const totalAvailable = event.ticketTypes.reduce((sum, t) => sum + t.quantityAvailable, 0);

            return (
              <Link key={event.id} to={`/events/${event.id}`}>
                <Card padding="none" className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className="p-6 flex flex-col h-full">
                    <h3 className="text-xl font-semibold mb-2 line-clamp-1">{event.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2 flex-grow">{event.description}</p>

                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{format(new Date(event.date), 'PPP')}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        <span>{totalAvailable} tickets available</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-lg font-bold text-primary-600">
                          From ${minPrice.toFixed(2)}
                        </span>
                        <Button size="sm">
                          View Details →
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xl text-gray-500 mb-2">No events available</p>
          <p className="text-gray-400">Check back soon for upcoming events</p>
        </div>
      )}
    </Container>
  );
};
