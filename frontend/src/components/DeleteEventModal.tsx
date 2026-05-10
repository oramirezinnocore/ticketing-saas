import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/Button';
import { eventTexts } from '@/i18n/events';

interface DeleteEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventTitle: string;
  isDeleting: boolean;
}

export const DeleteEventModal = ({
  isOpen,
  onClose,
  onConfirm,
  eventTitle,
  isDeleting,
}: DeleteEventModalProps) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="ml-4 text-lg font-medium leading-6 text-gray-900"
                  >
                    {eventTexts.organizer.deleteConfirmTitle}
                  </Dialog.Title>
                </div>

                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-2">
                    {eventTexts.organizer.deleteConfirmMessage}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    "{eventTitle}"
                  </p>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isDeleting}
                  >
                    {eventTexts.organizer.deleteCancel}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  >
                    {isDeleting ? eventTexts.organizer.deleting : eventTexts.organizer.deleteConfirm}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
