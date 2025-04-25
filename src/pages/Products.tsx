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
import { Product } from '../types';

interface FilterState {
  category: string | null;
  search: string;
  minPrice: number | null;
  maxPrice: number | null;
  rating: number | null;
}

interface Category {
  id: string;
  name: string;
}

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { items } = useSelector(
    (state: RootState) => state.products
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    category: null,
    search: '',
    minPrice: null,
    maxPrice: null,
    rating: null
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://sportzone-api.onrender.com/api/Categories');
        const data = await response.json();
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data.items && Array.isArray(data.items)) {
          setCategories(data.items);
        } else {
          console.error('Unexpected categories response format:', data);
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = 'https://sportzone-api.onrender.com/api/Products';
        const params = new URLSearchParams();
        
        if (filters.search.trim() !== '') {
          params.append('Title', filters.search.trim());
        }
        if (filters.category) {
          params.append('CategoryId', filters.category);
        }
        if (filters.minPrice !== null) {
          params.append('MinPrice', filters.minPrice.toString());
        }
        if (filters.maxPrice !== null) {
          params.append('MaxPrice', filters.maxPrice.toString());
        }
        if (filters.rating !== null) {
          params.append('MinRating', filters.rating.toString());
        }

        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }

        console.log('Fetching products with URL:', url); 

        const response = await fetch(url);
        console.log(url);
        
        const data = await response.json();
        console.log(data);
        
        if (data.items && Array.isArray(data.items)) {
          setProducts(data.items);
        } else {
          console.error('Unexpected API response format:', data);
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      }
    };
    fetchProducts();
  }, [filters]);

  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const rating = searchParams.get('rating');
    
    setFilters(prev => ({
      ...prev,
      category: category || null,
      search: search || '',
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
      rating: rating ? Number(rating) : null
    }));
  }, [searchParams]);

  const handleApplyFilters = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      
      if (newFilters.category) {
        newParams.set('category', newFilters.category);
      } else {
        newParams.delete('category');
      }
      
      if (newFilters.search) {
        newParams.set('search', newFilters.search);
      } else {
        newParams.delete('search');
      }
      
      if (newFilters.minPrice !== undefined) {
        newParams.set('minPrice', newFilters.minPrice?.toString() || '');
      }
      
      if (newFilters.maxPrice !== undefined) {
        newParams.set('maxPrice', newFilters.maxPrice?.toString() || '');
      }
      
      if (newFilters.rating !== undefined) {
        newParams.set('rating', newFilters.rating?.toString() || '');
      }
      
      return newParams;
    });
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null;
    return categories.find(c => c.id === categoryId)?.name || null;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dark-700">
              {getCategoryName(filters.category) ? `${getCategoryName(filters.category)} Продукти` : 'Всички продукти'}
            </h1>
            <p className="text-dark-600 mt-2">
              Намерени {products.length} продукта
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
            selectedCategory={filters.category}
            searchQuery={filters.search}
            onApplyFilters={handleApplyFilters}
          />
          
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={{
                    ...product,
                    regularPrice: product.regularPrice
                  }}
                />
              ))}
            </div>

            {products.length === 0 && (
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