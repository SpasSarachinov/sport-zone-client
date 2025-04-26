import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProductCard from '../components/products/ProductCard';

interface Category {
  imageURI: string | undefined;
  id: string;
  name: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  regularPrice: number;
  primaryImageUrl: string;
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
  discountPercentage?: number;
}

const Home = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchCategories();
    fetchBestSellers();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://sportzone-api.onrender.com/api/Categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    }
  };

  const fetchBestSellers = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://sportzone-api.onrender.com/api/Products/best-sellers?numOfBestSellers=3');
      if (!response.ok) {
        throw new Error('Failed to fetch best sellers');
      }
      const data = await response.json();
      console.log('Best sellers data:', data);
      setBestSellers(data);
    } catch (err) {
      console.error('Error fetching best sellers:', err);
      setError('Failed to load best sellers');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Добре дошли в SportZone</h1>
          <p className="hero-subtitle">
            Вашата дестинация за премиум спортна екипировка и аксесоари.
          </p>
          <Link to="/products" className="btn btn-primary hover:text-gray-900">
            Пазарувай сега
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">Категории</h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {error ? (
            <div className="col-span-3 text-center text-red-600">{error}</div>
          ) : categories.length === 0 ? (
            <div className="col-span-3 text-center">Зареждане на категории...</div>
          ) : (
            categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${encodeURIComponent(category.id)}`}
                className="category-card group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={category.imageURI}
                    alt={`${category.name} Екипировка`}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <div className="p-4 w-full">
                    <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-section py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-title mb-8">Препоръчани Продукти</h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading best sellers...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {bestSellers.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                />
              ))}
              {bestSellers.length === 0 && (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-600">No featured products available at the moment.</p>
                </div>
              )}
            </div>
          )}
          <div className="text-center mt-8">
            <Link 
              to="/products" 
              className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 hover:text-gray-900 transition-colors duration-200"
            >
              Преглед на всички продукти
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-title">Защо Да Изберете Нас</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {/* Fast Delivery */}
            <div className="card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="heading-3 mb-2">Бърза Доставка</h3>
              <p className="text-body">Бърза и надеждна доставка до вашия адрес</p>
            </div>

            {/* Quality Guarantee */}
            <div className="card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="heading-3 mb-2">Гарантирано Качество</h3>
              <p className="text-body">Всички продукти са качествено проверени</p>
            </div>

            {/* Easy Returns */}
            <div className="card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                </svg>
              </div>
              <h3 className="heading-3 mb-2">Лесно Връщане</h3>
              <p className="text-body">30-дневна политика за връщане на всички продукти</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 