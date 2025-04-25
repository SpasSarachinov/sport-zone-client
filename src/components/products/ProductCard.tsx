import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addItem } from '../../store/slices/cartSlice';
import { ShoppingCartIcon, StarIcon } from '@heroicons/react/24/solid';

interface Product {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  regularPrice: number;
  quantity: number;
  categoryId: string;
  rating?: number;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the button
    dispatch(
      addItem({
        id: product.id,
        title: product.title,
        regularPrice: product.regularPrice,
        quantity: 1,
        imageUrl: product.imageUrl,
      })
    );
  };

  const displayPrice = (price: number | undefined) => {
    if (price === undefined) return '0.00';
    return price.toFixed(2) + ' лв.';
  };

  return (
    <Link to={`/products/${product.id}`} className="block">
      <div className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-[400px]">
        {/* Product Image - Fixed height */}
        <div className="h-48 w-full overflow-hidden bg-gray-200">
          <img
            src={product.imageUrl || '/placeholder-image.jpg'}
            alt={product.title}
            className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
          />
        </div>

        {/* Product Info - Using flex column for layout */}
        <div className="p-4 h-[calc(400px-192px)] flex flex-col">
          {/* Title - Fixed height with ellipsis */}
          <div className="flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {product.title}
            </h3>
          </div>

          {/* Bottom Section with Rating, Price, Availability, and Button */}
          <div className="mt-auto space-y-3">
            {/* Rating */}
            <div className="flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(product.rating || 0)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-1 text-sm text-gray-600">
                ({product.rating?.toFixed(1) || '0.0'})
              </span>
            </div>

            {/* Price and Availability */}
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-gray-900">
                {displayPrice(product.regularPrice)}
              </p>
              <div className="flex items-center">
                <div className={`h-2 w-2 rounded-full mr-2 ${
                  product.quantity > 0 ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className={`text-sm ${
                  product.quantity > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.quantity > 0 ? 'В наличност' : 'Няма в наличност'}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className={`w-full h-12 flex items-center justify-center px-4 py-2 rounded-md ${
                product.quantity === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
              disabled={product.quantity === 0}
            >
              <ShoppingCartIcon className="h-5 w-5 mr-2" />
              {product.quantity === 0 ? 'Няма в наличност' : 'Добави в количка'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard; 