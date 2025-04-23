import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addItem } from '../store/slices/cartSlice';
import { StarIcon } from '@heroicons/react/24/solid';
import { HeartIcon } from '@heroicons/react/24/outline';

// Hardcoded product data
const product = {
  id: '1',
  name: 'Nike Air Max 270',
  description: 'Модерни маратонки с въздушна подложка за максимален комфорт при бягане. Идеални за дълги разходки и спортни дейности.',
  price: 299.99,
  discount: 20,
  category: 'Маратонки',
  stock: 10,
  rating: 4.5,
  reviews: [
    {
      id: '1',
      userName: 'Иван Петров',
      rating: 5,
      comment: 'Отлични маратонки! Много удобни и издръжливи.',
      date: '2024-02-15',
    },
    {
      id: '2',
      userName: 'Мария Иванова',
      rating: 4,
      comment: 'Добри маратонки, но малко тесни за моя размер.',
      date: '2024-02-10',
    },
  ],
  images: [
    'https://example.com/shoe1.jpg',
    'https://example.com/shoe2.jpg',
    'https://example.com/shoe3.jpg',
  ],
  features: [
    'Въздушна подложка за амортизация',
    'Лека и дишаща материя',
    'Антиплъзгаща се подметка',
    'Подходящи за различни видове терен',
  ],
};

const ProductDetails = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(
      addItem({
        id: product.id,
        name: product.name,
        price: product.price * (1 - product.discount / 100),
        quantity,
        image: product.images[0],
      })
    );
  };

  const discountedPrice = product.price * (1 - product.discount / 100);

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden ${
                    selectedImage === index ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} - Изглед ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-dark-700">{product.name}</h1>
              <div className="flex items-center mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 ml-2">
                  ({product.reviews.length} отзива)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {product.discount > 0 && (
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold text-primary-600">
                    {discountedPrice.toFixed(2)} лв.
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    {product.price.toFixed(2)} лв.
                  </span>
                  <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-md text-sm">
                    -{product.discount}%
                  </span>
                </div>
              )}
              {product.discount === 0 && (
                <span className="text-2xl font-bold text-primary-600">
                  {product.price.toFixed(2)} лв.
                </span>
              )}
            </div>

            <p className="text-gray-600">{product.description}</p>

            <div className="space-y-4">
              <h3 className="font-medium text-dark-700">Характеристики:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-2">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
              >
                Добави в количката
              </button>
              <button className="p-2 text-gray-600 hover:text-primary-600">
                <HeartIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="font-medium text-dark-700 mb-4">Отзиви:</h3>
              <div className="space-y-4">
                {product.reviews.map((review) => (
                  <div key={review.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{review.userName}</span>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails; 