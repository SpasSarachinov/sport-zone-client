import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import {
  setProducts,
  setSelectedCategory,
  setSearchQuery,
} from '../store/slices/productsSlice';
import ProductCard from '../components/products/ProductCard';
import FilterSidebar from '../components/products/FilterSidebar';
import { PencilIcon, PlusIcon } from '@heroicons/react/24/outline';

// Hardcoded products data
const hardcodedProducts = [
  {
    id: '1',
    name: 'Nike Air Max 270',
    description: 'Модерни маратонки с въздушна подложка за максимален комфорт при бягане.',
    price: 299.99,
    discount: 20,
    category: 'Маратонки',
    stock: 10,
    rating: 4.5,
    reviews: [
      {
        id: '1',
        userId: '1',
        userName: 'Иван Петров',
        rating: 5,
        comment: 'Отлични маратонки!',
        date: '2024-02-15',
      },
    ],
    image: 'https://example.com/shoe1.jpg',
  },
  {
    id: '2',
    name: 'Adidas Predator Edge',
    description: 'Футболни кецове с подобрена контрола и точност.',
    price: 249.99,
    discount: 0,
    category: 'Футболни кецове',
    stock: 15,
    rating: 4.8,
    reviews: [
      {
        id: '2',
        userId: '2',
        userName: 'Георги Иванов',
        rating: 5,
        comment: 'Най-добрите футболни кецове!',
        date: '2024-02-10',
      },
    ],
    image: 'https://example.com/shoe2.jpg',
  },
  {
    id: '3',
    name: 'Wilson Pro Staff',
    description: 'Тенис ракета за професионалисти.',
    price: 199.99,
    discount: 15,
    category: 'Тенис',
    stock: 8,
    rating: 4.7,
    reviews: [
      {
        id: '3',
        userId: '3',
        userName: 'Мария Георгиева',
        rating: 4,
        comment: 'Отлично качество!',
        date: '2024-02-05',
      },
    ],
    image: 'https://example.com/racket1.jpg',
  },
  {
    id: '4',
    name: 'Nike Dri-FIT',
    description: 'Спортен тениска с технология за изсушаване на потта.',
    price: 49.99,
    discount: 0,
    category: 'Спортни дрехи',
    stock: 20,
    rating: 4.3,
    reviews: [
      {
        id: '4',
        userId: '4',
        userName: 'Петър Стоянов',
        rating: 5,
        comment: 'Много удобна тениска!',
        date: '2024-02-01',
      },
    ],
    image: 'https://example.com/tshirt1.jpg',
  },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { items, categories, selectedCategory, searchQuery } = useSelector(
    (state: RootState) => state.products
  );
  const { user } = useSelector((state: RootState) => state.auth);

  // Set hardcoded products on component mount
  useEffect(() => {
    dispatch(setProducts(hardcodedProducts));
  }, [dispatch]);

  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    if (category) {
      dispatch(setSelectedCategory(category));
    }
    if (search) {
      dispatch(setSearchQuery(search));
    }
  }, [searchParams, dispatch]);

  const handleCategoryChange = (category: string | null) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (category) {
        newParams.set('category', category);
      } else {
        newParams.delete('category');
      }
      return newParams;
    });
  };

  const handleSearchChange = (query: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (query) {
        newParams.set('search', query);
      } else {
        newParams.delete('search');
      }
      return newParams;
    });
  };

  const handlePriceRangeChange = (range: { min: number; max: number }) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('minPrice', range.min.toString());
      newParams.set('maxPrice', range.max.toString());
      return newParams;
    });
  };

  const handleRatingChange = (rating: number) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (rating > 0) {
        newParams.set('rating', rating.toString());
      } else {
        newParams.delete('rating');
      }
      return newParams;
    });
  };

  const filteredProducts = items.filter((product) => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dark-700">
              {selectedCategory ? `${selectedCategory} Продукти` : 'Всички продукти'}
            </h1>
            <p className="text-dark-600 mt-2">
              Намерени {filteredProducts.length} продукта
            </p>
          </div>
          {/* Admin Panel Links - Only visible to admin users */}
          {user?.role === 'admin' && (
            <div className="flex space-x-4">
              <Link
                to="/admin/products/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Нов продукт
              </Link>
              <Link
                to="/admin/products"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <PencilIcon className="h-5 w-5 mr-2" />
                Управление на продуктите
              </Link>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <FilterSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onPriceRangeChange={handlePriceRangeChange}
            onRatingChange={handleRatingChange}
          />
          
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-dark-600 text-lg">
                  Няма намерени продукти, отговарящи на вашите критерии.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products; 