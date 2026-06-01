import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';

/**
 * Simplified CheckoutPage - Only used as fallback if someone lands here directly
 * The main purchase flow redirects directly to MercadoPago from EventDetailPage
 */
export const CheckoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/events');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Container className="py-12" size="md">
      <Card className="text-center py-16">
        <div className="mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-gray-900">
          Procesando tu compra
        </h2>
        <p className="text-gray-600 mb-1">Redirigiendo al portal de pago seguro...</p>
        <p className="text-sm text-gray-500">Por favor espera</p>
      </Card>
    </Container>
  );
};
