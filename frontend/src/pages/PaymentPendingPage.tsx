import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '@/api/payments';
import { useCheckoutStore } from '@/store/checkoutStore';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export const PaymentPendingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentOrder } = useCheckoutStore();

  const paymentId = searchParams.get('payment_id');
  const orderId = currentOrder?.id;

  const { data: payment, isLoading, refetch } = useQuery({
    queryKey: ['payment', orderId],
    queryFn: () => paymentsApi.getByOrderId(orderId!),
    enabled: !!orderId,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  if (isLoading) {
    return (
      <Container className="py-12">
        <Card className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold mb-2">Checking Payment Status...</h2>
          <p className="text-gray-600">Please wait</p>
        </Card>
      </Container>
    );
  }

  // If payment is now approved, redirect to success
  if (payment?.status === 'approved') {
    navigate('/payment/success?payment_id=' + paymentId, { replace: true });
    return null;
  }

  return (
    <Container className="py-12">
      <Card className="text-center py-16 max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-yellow-600 mb-2">Payment Pending</h1>
          <p className="text-xl text-gray-700 mb-6">
            Your payment is being processed
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8 text-left">
          <h3 className="font-semibold text-yellow-800 mb-2">What happens next?</h3>
          <ul className="space-y-2 text-sm text-yellow-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>We're waiting for payment confirmation from your payment provider</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>This usually takes a few minutes, but can take up to 24 hours</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>You'll receive an email once your payment is confirmed</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Your tickets will be available in your wallet after confirmation</span>
            </li>
          </ul>
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
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                  {payment.status}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => refetch()}>
            Check Status Again
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/events')}>
            Browse Events
          </Button>
        </div>
      </Card>
    </Container>
  );
};
