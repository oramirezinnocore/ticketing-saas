import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/api/events';
import { useAuth } from '@/hooks/useAuth';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { DeleteEventModal } from '@/components/DeleteEventModal';
import { eventTexts } from '@/i18n/events';
import { toast } from 'react-hot-toast';

export const OrganizerEventsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{ id: string; title: string } | null>(null);

  const {
    data: events = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['events'],
    queryFn: eventsApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (eventId: string) => eventsApi.delete(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success(eventTexts.organizer.deleteSuccess);
      setDeleteModalOpen(false);
      setEventToDelete(null);
    },
    onError: () => {
      toast.error(eventTexts.organizer.deleteError);
    },
  });

  const handleDeleteClick = (eventId: string, eventTitle: string) => {
    setEventToDelete({ id: eventId, title: eventTitle });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (eventToDelete) {
      deleteMutation.mutate(eventToDelete.id);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setEventToDelete(null);
  };

  // Filter events created by current organizer

  const organizerEvents = events.filter((event) => {
    const matches = String(event.organizerId) === String(user?.id);
    console.log(`[Filter] Event: ${event.title}, organizerId: "${event.organizerId}", userId: "${user?.id}", matches: ${matches}`);
    return matches;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateTotalTickets = (event: typeof events[0]) => {
    return event.ticketTypes.reduce((sum, type) => sum + type.quantity, 0);
  };

  const calculateAvailableTickets = (event: typeof events[0]) => {
    return event.ticketTypes.reduce((sum, type) => sum + type.quantityAvailable, 0);
  };

  return (
    <Container>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Events</h1>
        <Link to="/organizer/events/create">
          <Button>Create Event</Button>
        </Link>
      </div>

      {isLoading && (
        <Card>
          <div className="text-center py-8 text-gray-500">Loading your events...</div>
        </Card>
      )}

      {error && (
        <Card>
          <div className="text-center py-8 text-red-600">
            Failed to load events. Please try again later.
          </div>
        </Card>
      )}

      {!isLoading && !error && organizerEvents.length === 0 && (
        <Card>
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first event.
            </p>
            <div className="mt-6">
              <Link to="/organizer/events/create">
                <Button>Create Event</Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {!isLoading && !error && (
        <>
          {/* DEBUG INFO */}
          <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
            <p className="font-bold">DEBUG INFO:</p>
            <p>Total events: {events.length}</p>
            <p>Filtered (owner) events: {organizerEvents.length}</p>
            <p>User ID: {user?.id}</p>
            <p>User Role: {user?.role}</p>
            <p>Is Admin: {user?.role === 'admin' ? 'YES' : 'NO'}</p>
            <p>Is Organizer: {user?.role === 'organizer' ? 'YES' : 'NO'}</p>
          </div>

          {organizerEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizerEvents.map((event) => {
                const totalTickets = calculateTotalTickets(event);
                const availableTickets = calculateAvailableTickets(event);
                const soldTickets = totalTickets - availableTickets;
                const soldPercentage = totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0;

                // DEBUG: Log each event being rendered
                console.log(`[Render] Rendering event: ${event.title}, ID: ${event.id}, organizerId: ${event.organizerId}`);

                return (
                  <Card key={event.id} padding="md">
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="text-sm text-gray-500 mb-4">
                      <div className="flex items-center mb-1">
                        <svg
                          className="w-4 h-4 mr-2"
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
                        {formatDate(event.date)}
                      </div>
                    </div>

                    {/* Ticket Sales Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Tickets Sold</span>
                        <span className="font-medium">
                          {soldTickets} / {totalTickets}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${soldPercentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {availableTickets} tickets remaining
                      </div>
                    </div>

                    {/* Ticket Types */}
                    <div className="mt-4">
                      <p className="text-xs font-medium text-gray-700 mb-2">Ticket Types:</p>
                      <div className="space-y-1">
                        {event.ticketTypes.map((type, index) => (
                          <div key={index} className="text-xs text-gray-600 flex justify-between">
                            <span>{type.name}</span>
                            <span>${type.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                    {/* DEBUG: Show we're in the button section */}
                    <div className="mb-2 p-2 bg-blue-100 text-xs">
                      <p>DEBUG: Buttons section for "{event.title}"</p>
                      <p>organizerId: {event.organizerId}</p>
                      <p>userId: {user?.id}</p>
                      <p>Match: {String(event.organizerId) === String(user?.id) ? 'YES' : 'NO'}</p>
                    </div>

                    <Link to={`/events/${event.id}`}>
                      <Button variant="outline" size="sm" fullWidth>
                        {eventTexts.organizer.viewDetails}
                      </Button>
                    </Link>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => toast('Función de edición próximamente', { icon: 'ℹ️' })}
                      >
                        {eventTexts.organizer.editEvent}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 hover:text-red-700 hover:border-red-600"
                        onClick={() => {
                          console.log('[Delete] Button clicked for event:', event.id, event.title);
                          handleDeleteClick(event.id, event.title);
                        }}
                      >
                        {eventTexts.organizer.deleteEvent}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
                );
              })}
            </div>
          )}

          {organizerEvents.length === 0 && (
            <div className="p-4 bg-red-100 border border-red-300 rounded">
              <p className="font-bold text-red-700">No events matched the filter!</p>
              <p>This means event.organizerId !== user.id for all events</p>
              <p>Check the console for detailed comparison logs</p>
            </div>
          )}
        </>
      )}

      <DeleteEventModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        eventTitle={eventToDelete?.title || ''}
        isDeleting={deleteMutation.isPending}
      />
    </Container>
  );
};
