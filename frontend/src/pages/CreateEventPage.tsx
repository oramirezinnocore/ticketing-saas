import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/api/events';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { createEventSchema, type CreateEventFormData } from '@/lib/validations';

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      ticketTypes: [{ name: 'General Admission', price: 0, quantity: 100 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ticketTypes',
  });

  const createEventMutation = useMutation({
    mutationFn: eventsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/organizer');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const errorMessage = error.response?.data?.message || 'Failed to create event';
      setError('root', { message: errorMessage });
    },
  });

  const onSubmit = (data: CreateEventFormData) => {
    const eventDate = new Date(data.date);
    if (eventDate < new Date()) {
      setError('date', { message: 'Event date must be in the future' });
      return;
    }

    createEventMutation.mutate({
      ...data,
      date: eventDate.toISOString(),
    });
  };

  return (
    <Container size="md" className="py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/organizer')}
          className="text-gray-600 hover:text-gray-900 flex items-center text-sm mb-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold">Create New Event</h1>
      </div>

      <Card>
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {errors.root.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Event Details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  {...register('title')}
                  placeholder="Tech Conference 2024"
                  maxLength={300}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting || createEventMutation.isPending}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe your event..."
                  rows={5}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting || createEventMutation.isPending}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  id="date"
                  type="datetime-local"
                  {...register('date')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting || createEventMutation.isPending}
                />
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Ticket Types</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: '', price: 0, quantity: 100 })}
                disabled={isSubmitting || createEventMutation.isPending}
              >
                + Add Ticket Type
              </Button>
            </div>

            {errors.ticketTypes && typeof errors.ticketTypes === 'object' && 'message' in errors.ticketTypes && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors.ticketTypes.message}
              </div>
            )}

            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} padding="sm" className="bg-gray-50">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label
                          htmlFor={`ticketTypes.${index}.name`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Ticket Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id={`ticketTypes.${index}.name`}
                          type="text"
                          {...register(`ticketTypes.${index}.name`)}
                          placeholder="General Admission"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            errors.ticketTypes?.[index]?.name
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          disabled={isSubmitting || createEventMutation.isPending}
                        />
                        {errors.ticketTypes?.[index]?.name && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.ticketTypes[index]?.name?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor={`ticketTypes.${index}.price`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Price ($) <span className="text-red-500">*</span>
                        </label>
                        <input
                          id={`ticketTypes.${index}.price`}
                          type="number"
                          step="0.01"
                          min="0"
                          {...register(`ticketTypes.${index}.price`, { valueAsNumber: true })}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            errors.ticketTypes?.[index]?.price
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          disabled={isSubmitting || createEventMutation.isPending}
                        />
                        {errors.ticketTypes?.[index]?.price && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.ticketTypes[index]?.price?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor={`ticketTypes.${index}.quantity`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          id={`ticketTypes.${index}.quantity`}
                          type="number"
                          min="1"
                          {...register(`ticketTypes.${index}.quantity`, { valueAsNumber: true })}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            errors.ticketTypes?.[index]?.quantity
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          disabled={isSubmitting || createEventMutation.isPending}
                        />
                        {errors.ticketTypes?.[index]?.quantity && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.ticketTypes[index]?.quantity?.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="mt-6 text-red-600 hover:text-red-800 p-2"
                        aria-label="Remove ticket type"
                        disabled={isSubmitting || createEventMutation.isPending}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/organizer')}
              disabled={isSubmitting || createEventMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting || createEventMutation.isPending}
              disabled={isSubmitting || createEventMutation.isPending}
              className="flex-1"
            >
              Create Event
            </Button>
          </div>
        </form>
      </Card>
    </Container>
  );
};
