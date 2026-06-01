import { Component, ReactNode, ErrorInfo } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Container } from './Container';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container className="py-12" size="md">
          <Card className="text-center py-12">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
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
            <h2 className="text-2xl font-semibold mb-2 text-gray-900">
              Ocurrió un error al cargar el checkout
            </h2>
            <p className="text-gray-600 mb-6">
              Lo sentimos, algo salió mal. Por favor intenta recargar la página.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.location.reload()}>Recargar Página</Button>
              <Button variant="outline" onClick={() => (window.location.href = '/events')}>
                Volver a Eventos
              </Button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Detalles técnicos (dev only)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto text-red-600">
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </Card>
        </Container>
      );
    }

    return this.props.children;
  }
}
