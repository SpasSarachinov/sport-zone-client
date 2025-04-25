import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addItem } from '../../store/slices/cartSlice';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

interface Product {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  regularPrice: number;
  quantity: number;
  categoryId: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
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
    <div className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Product Image */}
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
        <img
          src={product.imageUrl || '/placeholder-image.jpg'}
          alt={product.title}
          className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
        />
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          <Link to={`/products/${product.id}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.title}
          </Link>
        </h3>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <p className="text-lg font-bold text-gray-900">
              {displayPrice(product.regularPrice)}
            </p>
          </div>
          <span className="text-sm text-gray-500">
            {product.quantity > 0 ? 'В наличност' : 'Няма в наличност'}
          </span>
        </div>

        <div className="mt-4">
          <button
            onClick={handleAddToCart}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            disabled={product.quantity === 0}
          >
            {product.quantity === 0 ? 'Няма в наличност' : 'Добави в количка'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 