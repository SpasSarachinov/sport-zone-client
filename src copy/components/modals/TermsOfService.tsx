import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface TermsOfServiceProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsOfService = ({ isOpen, onClose }: TermsOfServiceProps) => {
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
          <div className="fixed inset-0 bg-white " />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-dark-200 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-dark-700 flex justify-between items-center"
                >
                  <span>Общи условия</span>
                  <button
                    type="button"
                    className="rounded-md text-dark-500 hover:text-dark-700"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>
                <div className="mt-4 space-y-4 text-dark-700 max-h-[60vh] overflow-y-auto">
                  <section className="space-y-2">
                    <h4 className="font-semibold">1. Общи разпоредби</h4>
                    <p className="text-sm">
                      Настоящите общи условия уреждат отношенията между Sport Zone ("Дружеството") и потребителите на онлайн платформата.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-semibold">2. Регистрация и акаунт</h4>
                    <p className="text-sm">
                      За да използвате услугите ни, трябва да създадете акаунт с валиден имейл адрес и да приемете тези общи условия.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-semibold">3. Поръчки и плащания</h4>
                    <p className="text-sm">
                      Всички цени са в български лева и включват ДДС. Плащането се извършва чрез одобрените методи за плащане.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-semibold">4. Доставка</h4>
                    <p className="text-sm">
                      Доставката се извършва чрез нашите партньорски куриерски фирми. Срокът за доставка е между 2-5 работни дни.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-semibold">5. Връщане и рекламации</h4>
                    <p className="text-sm">
                      Имате право да върнете продукт в срок от 14 дни от получаването му, без да посочвате причина.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-semibold">6. Защита на личните данни</h4>
                    <p className="text-sm">
                      Вашите лични данни се обработват съгласно нашата Политика за поверителност и приложимото законодателство.
                    </p>
                  </section>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Разбрах
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TermsOfService; 