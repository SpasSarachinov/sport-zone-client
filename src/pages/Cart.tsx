import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { removeItem, updateQuantity, clearCart } from '../store/slices/cartSlice';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface CartItem {
  productId: string;
  singlePrice: number;
  totalPrice: number;
  quantity: number;
  title: string;
  primaryImageUri: string;
}

interface CartResponse {
  id: string;
  orderTotalPrice: number;
  items: CartItem[];
}

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updateQueue, setUpdateQueue] = useState<{productId: string, newQuantity: number}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await fetch('https://sportzone-api.onrender.com/api/Orders/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // If cart is empty, set cart to null and return
          setCart(null);
          return;
        }
        throw new Error('Failed to fetch cart items');
      }

      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Възникна грешка при зареждането на количката');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const processQueue = async () => {
      if (updateQueue.length === 0 || isProcessing) return;

      setIsProcessing(true);
      const { productId, newQuantity } = updateQueue[0];

      try {
        const item = cart?.items.find(item => item.productId === productId);
        if (!item) return;

        // Update local state immediately for better UX
        const updatedItems = cart?.items.map(item => 
          item.productId === productId 
            ? { ...item, quantity: newQuantity } 
            : item
        );
        setCart(prev => prev ? { ...prev, items: updatedItems || [] } : null);

        // Make API request
        if (newQuantity < item.quantity) {
          await fetch('https://sportzone-api.onrender.com/api/Orders/', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              productId: productId,
              quantity: 1
            })
          });
        } else {
          await fetch('https://sportzone-api.onrender.com/api/Orders', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              productId: productId,
              quantity: 1
            })
          });
        }

        // Refresh cart data
        await fetchCartItems();
      } catch (error) {
        console.error('Error updating quantity:', error);
        await fetchCartItems();
      } finally {
        // Remove processed item from queue
        setUpdateQueue(prev => prev.slice(1));
        setIsProcessing(false);
      }
    };

    processQueue();
  }, [updateQueue, isProcessing]);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    // Add to queue
    setUpdateQueue(prev => [...prev, { productId, newQuantity }]);
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      const item = cart?.items.find(item => item.productId === productId);
      if (!item) return;

      const response = await fetch('https://sportzone-api.onrender.com/api/Orders/', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: productId,
          quantity: item.quantity
        })
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      await fetchCartItems(); // Refresh the cart
      toast.success('Продуктът беше премахнат от количката', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Възникна грешка при премахването на продукта', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  const handleClearCart = async () => {
    try {
      const response = await fetch('https://sportzone-api.onrender.com/api/Orders/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      setCart(null);
      toast.success('Количката беше изчистена успешно', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Възникна грешка при изчистването на количката', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold text-gray-900">Количката е празна</h2>
          <p className="text-gray-600">Вашата количка е празна. Разгледайте нашите продукти и добавете нещо интересно!</p>
          <Link
            to="/products"
            className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Към продуктите
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Количка</h1>
          <button
            onClick={handleClearCart}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
          >
            <XMarkIcon className="h-5 w-5 mr-1" />
            Изчисти количката
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="divide-y divide-gray-200">
            {cart.items.map((item) => (
              <div key={item.productId} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img
                  src={item.primaryImageUri || '/placeholder-image.jpg'}
                  alt={item.title}
                  className="h-32 w-32 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-primary-600 font-semibold">
                      {item.singlePrice.toFixed(2)} лв.
                    </p>
                    <span className="text-gray-400">×</span>
                    <p className="text-primary-600 font-semibold">
                      {item.quantity}
                    </p>
                    <span className="text-gray-400">=</span>
                    <p className="text-primary-600 font-semibold">
                      {(item.singlePrice * item.quantity).toFixed(2)} лв.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                      className="px-3 py-1 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                      className="px-3 py-1 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.productId)}
                    className="text-gray-600 hover:text-gray-900 transition-colors p-2"
                    title="Премахни от количката"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Общо продукти: {cart.items.length}</p>
                <p className="text-xl font-semibold text-gray-900">
                  Обща сума: {cart.orderTotalPrice.toFixed(2)} лв.
                </p>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Продължи към плащане
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 