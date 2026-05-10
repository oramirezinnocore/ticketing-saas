import { useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Container } from '@/components/Container';
import { authTexts } from '@/i18n';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth, isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/events';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Debug log response
      console.debug('[Login] Backend response:', {
        hasUser: !!data?.user,
        hasToken: !!data?.token,
        userId: data?.user?.id,
        userRole: data?.user?.role,
      });

      // Validate response structure
      if (!data) {
        console.error('[Login] No data in response');
        setError('root', { message: authTexts.errors.serverError });
        return;
      }

      if (!data.token || typeof data.token !== 'string') {
        console.error('[Login] Missing or invalid token in response');
        setError('root', { message: authTexts.errors.authFailed });
        return;
      }

      if (!data.user || !data.user.id || !data.user.email || !data.user.role) {
        console.error('[Login] Missing or invalid user in response');
        setError('root', { message: authTexts.errors.authFailed });
        return;
      }

      // Attempt to set auth (validation happens in authStore)
      try {
        setAuth(data.user, data.token);

        // Only navigate if auth was successful (check isAuthenticated)
        // Note: setAuth may have cleared auth if token was invalid
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/events';
        navigate(from, { replace: true });
      } catch (error) {
        console.error('[Login] Error setting auth:', error);
        setError('root', { message: authTexts.errors.authFailed });
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      console.error('[Login] Login error:', error);
      const errorMessage = error.response?.data?.message || authTexts.errors.invalidCredentials;
      setError('root', { message: errorMessage });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <Container size="sm" className="py-12">
      <Card>
        <h1 className="text-3xl font-bold text-center mb-6">{authTexts.login.title}</h1>

        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {errors.root.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {authTexts.login.emailLabel}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting || loginMutation.isPending}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {authTexts.login.passwordLabel}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting || loginMutation.isPending}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            fullWidth
            isLoading={isSubmitting || loginMutation.isPending}
            disabled={isSubmitting || loginMutation.isPending}
          >
            {loginMutation.isPending ? authTexts.login.loading : authTexts.login.submitButton}
          </Button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          {authTexts.login.noAccount}{' '}
          <Link to="/register" className="text-primary-600 hover:underline">
            {authTexts.login.registerLink}
          </Link>
        </p>
      </Card>
    </Container>
  );
};
