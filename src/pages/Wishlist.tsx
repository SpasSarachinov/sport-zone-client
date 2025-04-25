import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { removeFromWishlist } from '../store/slices/userSlice';
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { addItem } from '../store/slices/cartSlice';

interface Product {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  regularPrice: number;
  quantity: number;
  categoryId: string;
  discount?: number;
}

const Wishlist = () => {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { wishlist } = useSelector((state: RootState) => state.user);
  const { token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      try {
        setLoading(true);
        const products = await Promise.all(
          wishlist.map(async (productId) => {
            const response = await fetch(`https://sportzone-api.onrender.com/api/Products/${productId}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (!response.ok) {
              throw new Error('Неуспешно зареждане на продукт');
            }
            return response.json();
          })
        );
        setWishlistProducts(products);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Възникна грешка при зареждането на продуктите');
      } finally {
        setLoading(false);
      }
    };

    if (wishlist.length > 0) {
      fetchWishlistProducts();
    } else {
      setLoading(false);
    }
  }, [wishlist, token]);

  const handleRemoveFromWishlist = (productId: string) => {
    dispatch(removeFromWishlist(productId));
  };

  const handleAddToCart = (product: Product) => {
    dispatch(
      addItem({
        id: product.id,
        title: product.title,
        regularPrice: product.regularPrice * (1 - (product.discount || 0) / 100),
        quantity: 1,
        imageUrl: product.imageUrl,
      })
    );
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-lg">Зареждане...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <HeartIcon className="h-16 w-16 text-primary-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Вашият списък с Любими продукти е празен</h2>
          <p className="text-gray-600 mb-6">Добавете продукти, които харесвате, в списъка с Любими продукти</p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center bg-primary-500 text-white px-6 py-3 rounded-md hover:bg-primary-600 transition-colors"
          >
            Разгледайте продуктите
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Списък с желания</h1>
          <span className="text-gray-600">{wishlistProducts.length} продукта</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                  <img
                    src={product.imageUrl || '/placeholder-image.jpg'}
                    alt={product.title}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <button
                  onClick={() => handleRemoveFromWishlist(product.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                  title="Премахни от списъка с желания"
                >
                  <HeartIcon className="h-5 w-5 text-red-500" />
                </button>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  <Link to={`/products/${product.id}`} className="hover:text-primary-500">
                    {product.title}
                  </Link>
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-gray-900">
                      {product.regularPrice.toFixed(2)} лв.
                    </p>
                    {product.discount && (
                      <p className="text-sm text-gray-500 line-through">
                        {(product.regularPrice * (1 + product.discount / 100)).toFixed(2)} лв.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 flex items-center justify-center bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors"
                  >
                    <ShoppingCartIcon className="h-5 w-5 mr-2" />
                    Добави
                  </button>
                  <Link
                    to={`/products/${product.id}`}
                    className="flex-1 text-center bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Детайли
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist; 