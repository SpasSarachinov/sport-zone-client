import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { toast, Toaster } from 'react-hot-toast';

const Toast = ({ message, type }: { message: string; type: 'success' | 'error' }) => {
  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`}>
      {message}
    </div>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [orderData, setOrderData] = useState({
    names: '',
    postalCode: '',
    country: '',
    city: '',
    address: '',
    phone: ''
  });

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('Моля, влезте в профила си преди да направите поръчка');
      return;
    }

    try {
      const response = await fetch('https://sportzone-api.onrender.com/api/Orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

      toast.success('Поръчката беше направена успешно!', {
        duration: 2000,
        position: 'top-center'
      });

      setTimeout(() => {
        toast.success('Благодарим ви за поръчката!', {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#4CAF50',
            color: '#fff',
            fontSize: '1.1rem',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
          },
        });
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Възникна грешка при изпращането на поръчката');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      {showToast && <Toast message={toastMessage} type={toastType} />}
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-white hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Назад
        </button>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Информация за поръчката</h1>
            
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label htmlFor="names" className="block text-sm font-medium text-gray-700">
                    Имена
                  </label>
                  <input
                    type="text"
                    id="names"
                    name="names"
                    value={orderData.names}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                      transition duration-150 ease-in-out
                      placeholder-gray-400 text-gray-900
                      hover:border-gray-400"
                    placeholder="Въведете пълното си име"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                    Пощенски код
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={orderData.postalCode}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                      transition duration-150 ease-in-out
                      placeholder-gray-400 text-gray-900
                      hover:border-gray-400"
                    placeholder="Въведете пощенски код"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Държава
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={orderData.country}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                      transition duration-150 ease-in-out
                      placeholder-gray-400 text-gray-900
                      hover:border-gray-400"
                    placeholder="Въведете държава"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    Град
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={orderData.city}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                      transition duration-150 ease-in-out
                      placeholder-gray-400 text-gray-900
                      hover:border-gray-400"
                    placeholder="Въведете град"
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Адрес
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={orderData.address}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                      transition duration-150 ease-in-out
                      placeholder-gray-400 text-gray-900
                      hover:border-gray-400"
                    placeholder="Въведете пълен адрес"
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={orderData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                      transition duration-150 ease-in-out
                      placeholder-gray-400 text-gray-900
                      hover:border-gray-400"
                    placeholder="Въведете телефонен номер"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex justify-center hover:text-gray-900 items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  Завърши поръчката
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 