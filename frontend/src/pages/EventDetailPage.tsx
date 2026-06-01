import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { eventsApi } from '@/api/events';
import { ordersApi } from '@/api/orders';
import { useAuth } from '@/hooks/useAuth';
import { useCheckoutStore } from '@/store/checkoutStore';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { EventImage } from '@/components/EventImage';
import { eventTexts, commonTexts } from '@/i18n';
import { formatDate, formatTime, formatCurrency, pluralize } from '@/utils/format';
import type { OrderTicketLine } from '@/types';

export const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { setCurrentOrder } = useCheckoutStore();
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getById(id!),
    enabled: !!id,
  });

  const createOrderWithPaymentMutation = useMutation({
    mutationFn: ordersApi.createWithPayment,
    onSuccess: (result) => {
      setCurrentOrder(result.order);
      window.location.href = result.initPoint;
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message || 'Error al procesar la compra. Por favor intenta de nuevo.';
      toast.error(message);
    },
  });

  const handleQuantityChange = (ticketType: string, quantity: number) => {
    setSelectedTickets((prev) => ({
      ...prev,
      [ticketType]: Math.max(0, quantity),
    }));
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!user?.email) {
      toast.error('No se encontró tu correo electrónico. Por favor inicia sesión nuevamente.');
      return;
    }

    const tickets: OrderTicketLine[] = Object.entries(selectedTickets)
      .filter(([, qty]) => qty > 0)
      .map(([ticketType, quantity]) => ({ ticketType, quantity }));

    if (tickets.length === 0) {
      toast.error('Por favor selecciona al menos un boleto');
      return;
    }

    createOrderWithPaymentMutation.mutate({
      eventId: id!,
      tickets,
      buyerEmail: user.email,
      description: event?.title ? `${event.title} - ${totalTickets} ${pluralize(totalTickets, 'boleto', 'boletos')}` : undefined,
    });
  };

  const total = Object.entries(selectedTickets).reduce((sum, [type, qty]) => {
    const ticket = event?.ticketTypes.find((t) => t.name === type);
    return sum + (ticket?.price || 0) * qty;
  }, 0);

  const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);

  if (isLoading) {
    return (
      <Container className="py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="h-5 bg-gray-200 rounded mb-6 w-1/2"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
              <div className="space-y-4">
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container className="py-12">
        <Card className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-semibold mb-2">{eventTexts.detail.notFound}</h2>
          <p className="text-gray-600 mb-6">{eventTexts.detail.notFoundMessage}</p>
          <Button onClick={() => navigate('/events')}>{eventTexts.detail.backToEvents}</Button>
        </Card>
      </Container>
    );
  }

  return (
    <>
      {/* Hero Cover Image */}
      <div className="relative h-96 overflow-hidden">
        <EventImage
          src={event.coverImageUrl}
          alt={event.coverImageAlt}
          title={event.title}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <Container className="relative h-full flex items-end pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-2xl mb-4">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">{formatDate(new Date(event.date), 'full')}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{formatTime(new Date(event.date))}</span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>

              <h2 className="text-xl font-semibold mb-3">{eventTexts.detail.aboutEvent}</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{event.description}</p>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <h2 className="text-xl font-semibold mb-1">{eventTexts.detail.selectTickets}</h2>
            <p className="text-sm text-gray-600 mb-4">{eventTexts.detail.selectTicketsSubtitle}</p>

            <div className="space-y-4 mb-6">
              {event.ticketTypes.map((ticket) => (
                <div key={ticket.name} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-lg">{ticket.name}</p>
                      <p className="text-2xl font-bold text-primary-600">{formatCurrency(ticket.price)}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      ticket.quantityAvailable > 10
                        ? 'bg-green-100 text-green-700'
                        : ticket.quantityAvailable > 0
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {ticket.quantityAvailable > 0
                        ? `${ticket.quantityAvailable} ${eventTexts.detail.available}`
                        : eventTexts.detail.soldOut}
                    </span>
                  </div>

                  {ticket.quantityAvailable > 0 ? (
                    <div className="flex items-center justify-center space-x-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(ticket.name, (selectedTickets[ticket.name] || 0) - 1)}
                        disabled={!selectedTickets[ticket.name]}
                        className="w-10 h-10 p-0"
                      >
                        <span className="text-lg">−</span>
                      </Button>
                      <input
                        type="number"
                        min="0"
                        max={ticket.quantityAvailable}
                        value={selectedTickets[ticket.name] || 0}
                        onChange={(e) => handleQuantityChange(ticket.name, parseInt(e.target.value) || 0)}
                        className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(ticket.name, (selectedTickets[ticket.name] || 0) + 1)}
                        disabled={(selectedTickets[ticket.name] || 0) >= ticket.quantityAvailable}
                        className="w-10 h-10 p-0"
                      >
                        <span className="text-lg">+</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-gray-500">
                      {eventTexts.detail.unavailable}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">{commonTexts.labels.subtotal}</span>
                <span className="font-semibold">{formatCurrency(total)}</span>
              </div>
              {totalTickets > 0 && (
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{totalTickets} {pluralize(totalTickets, 'boleto', 'boletos')}</span>
                  <span>{formatCurrency(total / totalTickets)} promedio</span>
                </div>
              )}
            </div>

            <Button
              fullWidth
              size="lg"
              onClick={handleCheckout}
              disabled={totalTickets === 0 || createOrderWithPaymentMutation.isPending}
              isLoading={createOrderWithPaymentMutation.isPending}
            >
              {createOrderWithPaymentMutation.isPending
                ? 'Procesando compra...'
                : totalTickets === 0
                ? eventTexts.detail.selectTicketsContinue
                : `${eventTexts.detail.buyTickets} ${totalTickets} ${pluralize(totalTickets, 'boleto', 'boletos')} • ${formatCurrency(total)}`}
            </Button>

            {!isAuthenticated && totalTickets > 0 && (
              <p className="text-xs text-center text-gray-500 mt-3">
                {eventTexts.detail.loginRequired}
              </p>
            )}
            </Card>
          </div>
        </div>
      </Container>
    </>
  );
};
