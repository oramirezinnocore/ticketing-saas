import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '@/api/payments';
import { useCheckoutStore } from '@/store/checkoutStore';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentOrder, clearCheckout } = useCheckoutStore();

  const paymentId = searchParams.get('payment_id');
  const orderId = currentOrder?.id;

  const { data: payment, isLoading } = useQuery({
    queryKey: ['payment', orderId],
    queryFn: () => paymentsApi.getByOrderId(orderId!),
    enabled: !!orderId,
    retry: 3,
    retryDelay: 2000,
  });

  useEffect(() => {
    if (payment && payment.status === 'approved') {
      // Clear checkout state after successful payment
      const timer = setTimeout(() => {
        clearCheckout();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [payment, clearCheckout]);

  if (isLoading) {
    return (
      <Container className="py-12">
        <Card className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold mb-2">Confirming Payment...</h2>
          <p className="text-gray-600">Please wait while we verify your payment</p>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <Card className="text-center py-16 max-w-2xl mx-auto">
        <div className="mb-6">
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
          <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
          <p className="text-xl text-gray-700 mb-6">
            Your tickets have been confirmed and are ready to use
          </p>
        </div>

        {payment && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold mb-4">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-mono">{paymentId || payment.externalId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">${payment.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                  {payment.status}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/tickets')}>
            View My Tickets
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/events')}>
            Browse More Events
          </Button>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          You will receive a confirmation email shortly with your ticket details
        </p>
      </Card>
    </Container>
  );
};
