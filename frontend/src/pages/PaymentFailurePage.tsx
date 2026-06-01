import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders';
import { eventsApi } from '@/api/events';
import { useCheckoutStore } from '@/store/checkoutStore';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { formatCurrency } from '@/utils/format';

export const PaymentFailurePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentOrder, clearCheckout } = useCheckoutStore();

  const paymentId = searchParams.get('payment_id');
  const externalReference = searchParams.get('external_reference');
  const orderId = currentOrder?.id || externalReference;

  // Fetch order if not in store
  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getById(orderId!),
    enabled: !!orderId && !currentOrder,
    retry: 2,
  });

  const displayOrder = currentOrder || order;

  // Fetch event for retry
  const { data: event } = useQuery({
    queryKey: ['event', displayOrder?.eventId],
    queryFn: () => eventsApi.getById(displayOrder!.eventId),
    enabled: !!displayOrder?.eventId,
  });

  const handleRetry = () => {
    if (displayOrder?.eventId) {
      navigate(`/events/${displayOrder.eventId}`);
    } else {
      navigate('/events');
    }
  };

  const handleCancel = () => {
    clearCheckout();
    navigate('/events');
  };

  return (
    <Container className="py-12" size="md">
      <Card className="text-center py-16 max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-red-600 mb-3">Pago rechazado</h1>
          <p className="text-xl text-gray-700">
            No pudimos procesar tu pago
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6 text-left">
          <h3 className="font-semibold text-red-800 mb-3">Razones comunes del rechazo:</h3>
          <ul className="space-y-2 text-sm text-red-700">
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>Fondos insuficientes en tu cuenta</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>Método de pago rechazado por tu banco</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>Datos de pago incorrectos</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>Tiempo de espera agotado o problema de conexión</span>
            </li>
          </ul>
        </div>

        {/* Event Info */}
        {event && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-lg mb-3 text-gray-900">Evento</h3>
            <p className="font-medium text-gray-900 mb-2">{event.title}</p>
            <p className="text-sm text-gray-600">Puedes intentar comprar los boletos nuevamente</p>
          </div>
        )}

        {/* Order Details */}
        {displayOrder && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Detalles de la orden</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ID de orden:</span>
                <span className="font-mono text-xs bg-white px-3 py-1 rounded border">{orderId?.slice(0, 16)}...</span>
              </div>
              {paymentId && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ID de pago:</span>
                  <span className="font-mono text-xs bg-white px-3 py-1 rounded border">{paymentId}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(displayOrder.total)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Estado:</span>
                <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Rechazado
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Button size="lg" onClick={handleRetry} className="shadow-lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Intentar de nuevo
          </Button>
          <Button size="lg" variant="outline" onClick={handleCancel}>
            Cancelar orden
          </Button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p>
              Tu orden aún está reservada temporalmente. Puedes intentar de nuevo con un método de pago diferente.
              {displayOrder?.expiresAt && (
                <span className="block mt-1 font-medium">
                  Expira en 15 minutos desde la creación.
                </span>
              )}
            </p>
          </div>
        </div>
      </Card>
    </Container>
  );
};
