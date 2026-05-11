import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ticketsApi, type TicketWithQR } from '@/api/tickets';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { format } from 'date-fns';
import { useState } from 'react';

export const TicketsPage = () => {
  const navigate = useNavigate();
  const [selectedTicket, setSelectedTicket] = useState<TicketWithQR | null>(null);

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: ticketsApi.getUserTickets,
  });

  // Group tickets by event
  const ticketsByEvent = tickets?.reduce((acc, ticket) => {
    const eventId = ticket.eventId._id || ticket.eventId.id || 'unknown';
    if (!acc[eventId]) {
      acc[eventId] = [];
    }
    acc[eventId].push(ticket);
    return acc;
  }, {} as Record<string, TicketWithQR[]>);

  if (isLoading) {
    return (
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </Card>
          ))}
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">My Tickets</h1>
          <p className="text-gray-600">
            {tickets?.length || 0} ticket{tickets?.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/events')}>
          Browse Events
        </Button>
      </div>

      {tickets && tickets.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(ticketsByEvent || {}).map(([eventId, eventTickets]) => (
            <EventTicketGroup
              key={eventId}
              eventId={eventId}
              tickets={eventTickets}
              onSelectTicket={setSelectedTicket}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-16">
          <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <h2 className="text-2xl font-semibold mb-2">No Tickets Yet</h2>
          <p className="text-gray-600 mb-6">
            You haven't purchased any tickets. Browse events to get started!
          </p>
          <Button onClick={() => navigate('/events')}>Browse Events</Button>
        </Card>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}
    </Container>
  );
};

interface EventTicketGroupProps {
  eventId: string;
  tickets: TicketWithQR[];
  onSelectTicket: (ticket: TicketWithQR) => void;
}

const EventTicketGroup = ({ eventId, tickets, onSelectTicket }: EventTicketGroupProps) => {
  // Event info is already populated in ticket.eventId
  const event = tickets[0]?.eventId;

  const validCount = tickets.filter((t) => t.status === 'valid').length;
  const usedCount = tickets.filter((t) => t.status === 'used').length;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-1">
          {event?.title || 'Loading event...'}
        </h2>
        {event && (
          <p className="text-gray-600">
            {format(new Date(event.date), 'PPP • p')}
          </p>
        )}
        <div className="flex gap-3 mt-2 text-sm">
          <span className="text-green-600 font-medium">
            {validCount} valid
          </span>
          {usedCount > 0 && (
            <span className="text-gray-500">
              {usedCount} used
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tickets.map((ticket) => (
          <Card
            key={ticket.id}
            padding="none"
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onSelectTicket(ticket)}
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Ticket</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    #{ticket.id.slice(0, 8)}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    ticket.status === 'valid'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {ticket.status}
                </span>
              </div>

              {ticket.status === 'valid' && ticket.qrCode && (
                <div className="bg-gray-50 border-2 border-primary-500 rounded-lg p-4 text-center">
                  <div className="h-32 flex items-center justify-center bg-white rounded mb-2">
                    <img
                      src={ticket.qrCode}
                      alt="QR Code"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-gray-600">Tap to view full QR code</p>
                </div>
              )}

              {ticket.status === 'used' && (
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-xs text-gray-600">This ticket has been used</p>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-3">
                Purchased {format(new Date(ticket.createdAt), 'PP')}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

interface TicketDetailModalProps {
  ticket: TicketWithQR;
  onClose: () => void;
}

const TicketDetailModal = ({ ticket, onClose }: TicketDetailModalProps) => {
  const event = ticket.eventId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              {event?.title || 'Ticket'}
            </h2>
            {event && (
              <p className="text-gray-600">{format(new Date(event.date), 'PPP • p')}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <span className="text-gray-600">Status</span>
            <span
              className={`px-3 py-1 text-sm font-medium rounded ${
                ticket.status === 'valid'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {ticket.status}
            </span>
          </div>

          {ticket.status === 'valid' && ticket.qrCode && (
            <div className="bg-white border-4 border-primary-600 rounded-lg p-6">
              <p className="text-center text-sm text-gray-600 mb-4 font-medium">
                Scan this QR code at the venue entrance
              </p>
              <div className="flex items-center justify-center bg-white rounded-lg p-4">
                <img
                  src={ticket.qrCode}
                  alt="Ticket QR Code"
                  className="w-full max-w-xs"
                />
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Ticket ID</span>
              <span className="font-mono">{ticket.id.slice(0, 16)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ticket Code</span>
              <span className="font-mono text-xs">{ticket.code.slice(0, 20)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Purchase Date</span>
              <span>{format(new Date(ticket.createdAt), 'PP')}</span>
            </div>
          </div>

          <Button fullWidth onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};
