import { useNavigate } from 'react-router-dom';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-xl text-gray-700 mb-6">
            You don't have permission to access this page
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <h3 className="font-semibold mb-3">Why am I seeing this?</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>This page requires special permissions (e.g., organizer or admin role)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Your current account doesn't have the required role</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>You may need to contact support to upgrade your account</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/')}>
            Go to Home
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </Card>
    </Container>
  );
};
