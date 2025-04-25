import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/slices/userSlice';
import { StarIcon, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { HeartIcon } from '@heroicons/react/24/outline';
import { RootState } from '../store';

interface Product {
  id: string;
  title: string;
  description: string;
  regularPrice: number;
  imageUrl: string;
  categoryId: string;
  quantity: number;
  rating: number;
  reviews: Array<{
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  discount?: number;
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();
  const { wishlist } = useSelector((state: RootState) => state.user);
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://sportzone-api.onrender.com/api/Products/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    dispatch(
      addItem({
        id: product.id,
        title: product.title,
        regularPrice: product.regularPrice * (1 - (product.discount || 0) / 100),
        quantity,
        imageUrl: product.imageUrl,
      })
    );
  };

  const isInWishlist = product ? wishlist.includes(product.id) : false;

  const handleWishlistToggle = () => {
    if (!product) return;
    fetch(`https://sportzone-api.onrender.com/api/Wishlist/add-product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId: product.id })
    });
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product.id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-lg">Зареждане...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-lg text-red-600">{error || 'Продуктът не е намерен'}</div>
      </div>
    );
  }

  const discountedPrice = product.regularPrice * (1 - (product.discount || 0) / 100);

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="h-full w-full object-cover object-center"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>

            {/* Price */}
            <div className="space-y-2">
              {product.discount ? (
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold text-primary-600">
                    {discountedPrice.toFixed(2)} лв.
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    {product.regularPrice.toFixed(2)} лв.
                  </span>
                  <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-md text-sm">
                    -{product.discount}%
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-primary-600">
                  {product.regularPrice.toFixed(2)} лв.
                </span>
              )}
            </div>

            <p className="text-gray-600">{product.description}</p>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                Количество:
              </label>
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:text-gray-700 focus:outline-none"
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-16 text-center border-x py-2 focus:outline-none"
                />
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="px-3 py-2 text-gray-600 hover:text-gray-700 focus:outline-none"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors"
              >
                Добави в количка
              </button>
              {token && (
                <button
                  onClick={handleWishlistToggle}
                  className="p-3 border rounded-md bg-gray-100 hover:bg-primary-100 transition-colors"
                  title={isInWishlist ? "Премахни от списъка с желания" : "Добави в списъка с желания"}
                >
                  {isInWishlist ? (
                    <HeartIconSolid className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6 text-gray-500" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-dark-700 mb-8">Отзиви на клиенти</h2>
            <div className="space-y-8">
              {product.reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-8">
                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{review.userName}</span>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                  <span className="text-sm text-gray-500 mt-2 block">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails; 