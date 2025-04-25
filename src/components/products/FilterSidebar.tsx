import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface Category {
  id: string;
  name: string;
}

interface FilterSidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  searchQuery: string;
  onApplyFilters: (filters: {
    category?: string | null;
    search?: string;
    minPrice?: number | null;
    maxPrice?: number | null;
    rating?: number | null;
  }) => void;
}

const FilterSidebar = ({
  categories,
  selectedCategory,
  searchQuery,
  onApplyFilters,
}: FilterSidebarProps) => {
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);

  const handleApplyAllFilters = () => {
    onApplyFilters({
      search: searchInput.trim(),
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
      rating: selectedRating || null
    });
  };

  const handleCategoryChange = (categoryId: string | null) => {
    onApplyFilters({ category: categoryId });
  };

  const handleRatingChange = (rating: number) => {
    const newRating = rating === selectedRating ? 0 : rating;
    setSelectedRating(newRating);
    onApplyFilters({ rating: newRating || null });
  };

  return (
    <div className="w-full md:w-64 space-y-6">
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Търсене на продукти..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        <button
          onClick={handleApplyAllFilters}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Търси
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-dark-700">Ценови диапазон</h3>
        <div className="flex space-x-4">
          <input
            type="number"
            placeholder="От"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="number"
            placeholder="До"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-medium text-dark-700">Категории</h3>
        <div className="space-y-2">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`w-full text-left px-4 py-2 rounded-md ${
              !selectedCategory
                ? 'bg-primary-100 text-primary-700'
                : 'text-dark-600 hover:bg-gray-100'
            }`}
          >
            Всички категории
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`w-full text-left px-4 py-2 rounded-md ${
                selectedCategory === category.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-dark-600 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      

      <div className="space-y-4">
        <h3 className="font-medium text-dark-700">Рейтинг</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              className={`w-full text-left px-4 py-2 rounded-md ${
                selectedRating === rating
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-dark-600 hover:bg-gray-100'
              }`}
            >
              {Array(rating).fill('★').join('')} и по-високо
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;