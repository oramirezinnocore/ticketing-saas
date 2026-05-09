import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCheckoutStore } from '@/store/checkoutStore';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export const PaymentFailurePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentOrder, clearCheckout } = useCheckoutStore();

  const paymentId = searchParams.get('payment_id');
  const orderId = currentOrder?.id;

  const handleRetry = () => {
    if (orderId) {
      navigate(`/checkout/${orderId}`);
    } else {
      navigate('/events');
    }
  };

  const handleCancel = () => {
    clearCheckout();
    navigate('/events');
  };

  return (
    <Container className="py-12">
      <Card className="text-center py-16 max-w-2xl mx-auto">
        <div className="mb-6">
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
          <h1 className="text-3xl font-bold text-red-600 mb-2">Payment Failed</h1>
          <p className="text-xl text-gray-700 mb-6">
            We couldn't process your payment
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 text-left">
          <h3 className="font-semibold text-red-800 mb-2">Common reasons for payment failure:</h3>
          <ul className="space-y-2 text-sm text-red-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Insufficient funds in your account</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Payment method declined by your bank</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Incorrect payment details</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Payment timeout or connection issue</span>
            </li>
          </ul>
        </div>

        {orderId && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold mb-4">Order Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono">{orderId}</span>
              </div>
              {paymentId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-mono">{paymentId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                  Failed
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={handleRetry}>
            Try Again
          </Button>
          <Button size="lg" variant="outline" onClick={handleCancel}>
            Cancel Order
          </Button>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Your order is still reserved. You can try again with a different payment method.
        </p>
      </Card>
    </Container>
  );
};
