import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toast } from 'react-toastify';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface Order {
  id: string;
  userId: string;
  names: string;
  postalCode: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  status: number;
  createdOn: string;
  orderTotalPrice: number;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    title: string;
  }>;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state: RootState) => state.auth);

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return 'Изчакване';
      case 2:
        return 'Завършена';
      case 3:
        return 'Отменена';
      default:
        return 'Неизвестен';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return 'bg-yellow-100 text-yellow-800';
      case 2:
        return 'bg-green-100 text-green-800';
      case 3:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('https://sportzone-api.onrender.com/api/Orders/get-list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      console.log('Orders API response:', data);
      
      let ordersArray = [];
      if (Array.isArray(data)) {
        ordersArray = data;
      } else if (data && data.items && Array.isArray(data.items)) {
        ordersArray = data.items;
      }
      
      setOrders(ordersArray);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Грешка при зареждането на поръчките');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: number) => {
    try {
      const response = await fetch(`https://sportzone-api.onrender.com/api/Orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      toast.success('Статусът на поръчката беше променен успешно');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Грешка при промяна на статуса на поръчката');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Поръчки</h1>
        
        {!loading && orders && orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Няма налични поръчки</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders && orders.map((order) => (
              <div key={order?.id || Math.random()} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Поръчка #{order?.id ? order.id.slice(0, 8) : 'N/A'}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Дата: {order?.createdOn ? formatDate(order.createdOn) : 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order?.status || 0)}`}>
                        {getStatusText(order?.status || 0)}
                      </span>
                      <div className="relative">
                        <select
                          value={order?.status || 0}
                          onChange={(e) => order?.id && handleStatusChange(order.id, parseInt(e.target.value))}
                          className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value={1}>Изчакване</option>
                          <option value={2}>Завършена</option>
                          <option value={3}>Отменена</option>
                        </select>
                        <ChevronDownIcon className="h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Обща сума:</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {new Intl.NumberFormat('bg-BG', {
                          style: 'currency',
                          currency: 'BGN'
                        }).format(order?.orderTotalPrice || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders; 