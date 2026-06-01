import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '@/api/payments';
import { ordersApi } from '@/api/orders';
import { eventsApi } from '@/api/events';
import { useCheckoutStore } from '@/store/checkoutStore';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { formatDate, formatTime, formatCurrency } from '@/utils/format';

export const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentOrder, clearCheckout } = useCheckoutStore();

  const paymentId = searchParams.get('payment_id');
  const collectionId = searchParams.get('collection_id');
  const externalReference = searchParams.get('external_reference');
  const orderId = currentOrder?.id || externalReference;

  // Fetch order if not in store (handles page refresh)
  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getById(orderId!),
    enabled: !!orderId && !currentOrder,
    retry: 2,
  });

  const displayOrder = currentOrder || order;

  // Fetch payment status
  const { data: payment, isLoading: paymentLoading } = useQuery({
    queryKey: ['payment', orderId],
    queryFn: () => paymentsApi.getByOrderId(orderId!),
    enabled: !!orderId,
    retry: 3,
    retryDelay: 2000,
  });

  // Fetch event details
  const { data: event } = useQuery({
    queryKey: ['event', displayOrder?.eventId],
    queryFn: () => eventsApi.getById(displayOrder!.eventId),
    enabled: !!displayOrder?.eventId,
  });

  useEffect(() => {
    if (payment && payment.status === 'approved') {
      const timer = setTimeout(() => {
        clearCheckout();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [payment, clearCheckout]);

  const isLoading = orderLoading || paymentLoading;

  if (isLoading) {
    return (
      <Container className="py-12" size="md">
        <Card className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold mb-2">Confirmando pago...</h2>
          <p className="text-gray-600">Por favor espera mientras verificamos tu pago</p>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-12" size="md">
      <Card className="text-center py-16 max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-green-600 mb-3">¡Compra exitosa!</h1>
          <p className="text-xl text-gray-700">
            Tus boletos han sido confirmados y están listos para usar
          </p>
        </div>

        {/* Event Details */}
        {event && (
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 mb-6 text-left">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-primary-900 mb-2">{event.title}</h3>
                <div className="space-y-1 text-sm text-primary-800">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(new Date(event.date), 'full')}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatTime(new Date(event.date))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Summary */}
        {displayOrder && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Resumen de compra</h3>
            <div className="space-y-3">
              {displayOrder.tickets.map((ticket, idx) => {
                const totalTickets = displayOrder.tickets.reduce((sum, t) => sum + t.quantity, 0);
                const ticketPrice = totalTickets > 0 ? (displayOrder.total / totalTickets) * ticket.quantity : 0;
                return (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-medium text-gray-900">{ticket.quantity}x {ticket.ticketType}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{formatCurrency(ticketPrice)}</span>
                  </div>
                );
              })}
              <div className="border-t border-gray-300 pt-3 mt-3 flex justify-between items-center">
                <span className="font-bold text-lg text-gray-900">Total</span>
                <span className="font-bold text-2xl text-primary-600">{formatCurrency(displayOrder.total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Details */}
        {payment && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Detalles del pago</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ID de orden:</span>
                <span className="font-mono text-xs bg-white px-3 py-1 rounded border">{orderId?.slice(0, 16)}...</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ID de pago:</span>
                <span className="font-mono text-xs bg-white px-3 py-1 rounded border">{paymentId || collectionId || payment.externalId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monto:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Estado:</span>
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Aprobado
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Button size="lg" onClick={() => navigate('/tickets')} className="shadow-lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            Ver mis boletos
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/events')}>
            Explorar más eventos
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p>
              Recibirás un correo de confirmación con los detalles de tus boletos.
              Puedes descargar tus boletos desde la sección "Mis Boletos".
            </p>
          </div>
        </div>
      </Card>
    </Container>
  );
};
