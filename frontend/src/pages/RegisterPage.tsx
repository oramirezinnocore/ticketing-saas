import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema, type RegisterFormData } from '@/lib/validations';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Container } from '@/components/Container';
import { authTexts } from '@/i18n';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/events', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // Debug log response
      console.debug('[Register] Backend response:', {
        hasUser: !!data?.user,
        hasToken: !!data?.token,
        userId: data?.user?.id,
        userRole: data?.user?.role,
      });

      // Validate response structure
      if (!data) {
        console.error('[Register] No data in response');
        setError('root', { message: authTexts.errors.serverError });
        return;
      }

      if (!data.token || typeof data.token !== 'string') {
        console.error('[Register] Missing or invalid token in response');
        setError('root', { message: authTexts.errors.registrationFailed });
        return;
      }

      if (!data.user || !data.user.id || !data.user.email || !data.user.role) {
        console.error('[Register] Missing or invalid user in response');
        setError('root', { message: authTexts.errors.registrationFailed });
        return;
      }

      // Attempt to set auth (validation happens in authStore)
      try {
        setAuth(data.user, data.token);
        navigate('/events', { replace: true });
      } catch (error) {
        console.error('[Register] Error setting auth:', error);
        setError('root', { message: authTexts.errors.registrationFailed });
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      console.error('[Register] Registration error:', error);
      const errorMessage = error.response?.data?.message || authTexts.errors.registrationFailed;
      setError('root', { message: errorMessage });
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
    });
  };

  return (
    <Container size="sm" className="py-12">
      <Card>
        <h1 className="text-3xl font-bold text-center mb-6">{authTexts.register.title}</h1>

        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {errors.root.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              {authTexts.register.nameLabel}
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              {...register('name')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting || registerMutation.isPending}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {authTexts.register.emailLabel}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting || registerMutation.isPending}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {authTexts.register.passwordLabel}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting || registerMutation.isPending}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {authTexts.register.passwordHint}
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {authTexts.register.confirmPasswordLabel}
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting || registerMutation.isPending}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            fullWidth
            isLoading={isSubmitting || registerMutation.isPending}
            disabled={isSubmitting || registerMutation.isPending}
          >
            {registerMutation.isPending ? authTexts.register.loading : authTexts.register.submitButton}
          </Button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          {authTexts.register.hasAccount}{' '}
          <Link to="/login" className="text-primary-600 hover:underline">
            {authTexts.register.loginLink}
          </Link>
        </p>
      </Card>
    </Container>
  );
};
