import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/api/events';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { format } from 'date-fns';

export const HomePage = () => {
  const { data: events } = useQuery({
    queryKey: ['events'],
    queryFn: eventsApi.getAll,
  });

  const featuredEvents = events?.slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <Container className="py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6">
              Your Tickets, Simplified
            </h1>
            <p className="text-lg md:text-2xl mb-8 text-primary-100 max-w-2xl mx-auto">
              Discover and purchase tickets for amazing events in seconds
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/events">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Browse Events
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="!text-white !border-white hover:!bg-white/10 w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">🎫</div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-primary-100">
                Select your event, choose tickets, and checkout in minutes
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Digital Tickets</h3>
              <p className="text-primary-100">
                Access your tickets instantly on any device
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
              <p className="text-primary-100">
                Your transactions are protected with industry-leading security
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* Featured Events */}
      {featuredEvents && featuredEvents.length > 0 && (
        <Container className="py-12 md:py-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Events</h2>
              <p className="text-gray-600">Don't miss out on these popular events</p>
            </div>
            <Link to="/events" className="hidden md:block">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map((event) => {
              const minPrice = Math.min(...event.ticketTypes.map((t) => t.price));
              const totalAvailable = event.ticketTypes.reduce((sum, t) => sum + t.quantityAvailable, 0);

              return (
                <Link key={event.id} to={`/events/${event.id}`}>
                  <Card padding="none" className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                    <div className="p-6 flex flex-col h-full">
                      <h3 className="text-xl font-semibold mb-2 line-clamp-2">{event.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2 flex-grow">{event.description}</p>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{format(new Date(event.date), 'PPP')}</span>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-lg font-bold text-primary-600">
                            From ${minPrice.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500">{totalAvailable} tickets</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/events">
              <Button variant="outline" fullWidth>View All Events</Button>
            </Link>
          </div>
        </Container>
      )}

      {/* CTA Section */}
      <div className="bg-gray-50 border-t border-gray-200">
        <Container className="py-12 md:py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Join thousands of event-goers who trust us for their ticketing needs
          </p>
          <Link to="/events">
            <Button size="lg">Explore Events</Button>
          </Link>
        </Container>
      </div>
    </div>
  );
};
