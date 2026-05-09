import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders';
import { paymentsApi } from '@/api/payments';
import { eventsApi } from '@/api/events';
import { useAuth } from '@/hooks/useAuth';
import { useCheckoutStore } from '@/store/checkoutStore';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { OrderStatus } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export const CheckoutPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setCurrentOrder } = useCheckoutStore();

  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getById(orderId!),
    enabled: !!orderId,
  });

  const { data: event } = useQuery({
    queryKey: ['event', order?.eventId],
    queryFn: () => eventsApi.getById(order!.eventId),
    enabled: !!order?.eventId,
  });

  const createPaymentMutation = useMutation({
    mutationFn: paymentsApi.createPreference,
    onSuccess: (data) => {
      if (order) {
        setCurrentOrder(order);
      }
      window.location.href = data.initPoint;
    },
    onError: (error: any) => {
      console.error('Payment creation failed:', error);
      alert(error.response?.data?.message || 'Failed to create payment. Please try again.');
    },
  });

  useEffect(() => {
    if (order?.status === OrderStatus.PAID) {
      navigate('/tickets');
    }
  }, [order, navigate]);

  const handlePay = () => {
    if (!order || !user) return;

    createPaymentMutation.mutate({
      orderId: order.id,
      description: event ? `${event.title} - Tickets` : `Order ${order.id}`,
      buyerEmail: user.email,
    });
  };

  if (orderLoading) {
    return (
      <Container className="py-12" size="md">
        <Card className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded mt-6"></div>
        </Card>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-12" size="md">
        <Card className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">This order doesn't exist or has been cancelled</p>
          <Button onClick={() => navigate('/events')}>Browse Events</Button>
        </Card>
      </Container>
    );
  }

  const isExpired = order.expiresAt && new Date(order.expiresAt) < new Date();
  const totalTickets = order.tickets.reduce((sum, t) => sum + t.quantity, 0);

  return (
    <Container className="py-8" size="md">
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-900 flex items-center text-sm"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold mb-1">Checkout</h1>
            <p className="text-sm text-gray-600">Order ID: {order.id}</p>
          </div>
          <div className={`px-3 py-1 rounded text-sm font-medium ${
            order.status === OrderStatus.PAID
              ? 'bg-green-100 text-green-700'
              : order.status === OrderStatus.CANCELLED
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {order.status}
          </div>
        </div>

        {event && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold mb-2">Event Details</h2>
            <p className="text-xl font-medium text-gray-900">{event.title}</p>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {order.tickets.map((ticket, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{ticket.ticketType}</p>
                  <p className="text-sm text-gray-600">Quantity: {ticket.quantity}</p>
                </div>
                <p className="font-semibold text-gray-900">
                  ${((order.total / totalTickets) * ticket.quantity).toFixed(2)}
                </p>
              </div>
            ))}

            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-bold">Total</p>
                  <p className="text-xs text-gray-500">{totalTickets} ticket{totalTickets > 1 ? 's' : ''}</p>
                </div>
                <p className="text-2xl font-bold text-primary-600">${order.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {order.expiresAt && order.status === OrderStatus.PENDING && !isExpired && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">Order Expiring Soon</p>
              <p className="text-sm text-yellow-700 mt-1">
                This order will expire {formatDistanceToNow(new Date(order.expiresAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        )}

        {isExpired && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-red-800">Order Expired</p>
            <p className="text-sm text-red-700 mt-1">
              This order has expired and the tickets have been released. Please create a new order.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            fullWidth
            size="lg"
            onClick={handlePay}
            isLoading={createPaymentMutation.isPending}
            disabled={order.status !== OrderStatus.PENDING || isExpired}
          >
            {order.status === OrderStatus.PENDING && !isExpired
              ? 'Proceed to Payment'
              : order.status === OrderStatus.PAID
              ? 'Order Complete'
              : isExpired
              ? 'Order Expired'
              : 'Order Cancelled'}
          </Button>

          {order.status === OrderStatus.PENDING && !isExpired && (
            <p className="text-xs text-center text-gray-500">
              You will be redirected to MercadoPago to complete your payment securely
            </p>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Secure payment powered by MercadoPago
          </div>
        </div>
      </Card>
    </Container>
  );
};
