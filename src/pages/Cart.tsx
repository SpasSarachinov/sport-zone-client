import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { removeItem, updateQuantity, clearCart } from '../store/slices/cartSlice';
import { TrashIcon } from '@heroicons/react/24/outline';

const Cart = () => {
  const dispatch = useDispatch();
  const { items, total } = useSelector((state: RootState) => state.cart);

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity > 0) {
      dispatch(updateQuantity({ id, quantity }));
    }
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeItem(id));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-dark-200 p-8 rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold text-dark-700">Количката е празна</h2>
          <p className="text-dark-600">Вашата количка е празна. Разгледайте нашите продукти и добавете нещо интересно!</p>
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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-dark-700 mb-8">Количка</h1>
        
        <div className="bg-dark-200 rounded-lg shadow-xl overflow-hidden">
          <div className="divide-y divide-dark-300">
            {items.map((item) => (
              <div key={item.id} className="p-6 flex items-center space-x-6">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-24 w-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-dark-700">{item.name}</h3>
                  <p className="text-primary-500 font-semibold">{item.price.toFixed(2)} лв.</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-dark-300 rounded-md">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="px-3 py-1 text-dark-700 hover:bg-dark-300"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-dark-700">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="px-3 py-1 text-dark-700 hover:bg-dark-300"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-dark-500 hover:text-red-500"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-dark-300">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm text-dark-600">Общо продукти: {items.length}</p>
                <p className="text-lg font-semibold text-dark-700">
                  Обща сума: {total.toFixed(2)} лв.
                </p>
              </div>
              <div className="space-x-4">
                <button
                  onClick={handleClearCart}
                  className="px-4 py-2 text-sm font-medium text-dark-700 hover:text-red-500"
                >
                  Изчисти количката
                </button>
                <Link
                  to="/checkout"
                  className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Продължи към плащане
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 