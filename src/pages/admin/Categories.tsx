import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface Category {
  id: string;
  name: string;
  productCount: number;
  imageURI: string;
}

interface FormData {
  name: string;
  imageURI: string;
}

interface ValidationErrors {
  name?: string;
  imageURI?: string;
}

const AdminCategories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<FormData>({ 
    name: '',
    imageURI: ''
  });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://sportzone-api.onrender.com/api/Categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Неуспешно зареждане на категории');
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Грешка при зареждане на категории:', err);
      setError('Неуспешно зареждане на категории');
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Името е задължително';
    } else if (formData.name.length < 2) {
      errors.name = 'Името трябва да е поне 2 символа';
    } else if (formData.name.length > 50) {
      errors.name = 'Името не може да е по-дълго от 50 символа';
    } else if (categories.some(cat => 
      cat.name.toLowerCase() === formData.name.toLowerCase() && 
      cat.id !== editingCategory?.id
    )) {
      errors.name = 'Категория с това име вече съществува';
    }

    // Image URL validation
    if (!formData.imageURI.trim()) {
      errors.imageURI = 'URL на изображението е задължително';
    } else {
      try {
        new URL(formData.imageURI);
      } catch {
        errors.imageURI = 'Моля, въведете валиден URL адрес';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when user starts typing
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      const url = `https://sportzone-api.onrender.com/api/Categories/`
      
      const response = await fetch(url, {
        method: editingCategory ? "PUT" : "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: editingCategory?.id,
          name: formData.name,
          imageURI: formData.imageURI
        })
      });
        

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Неуспешно запазване на категория');
      }

      await fetchCategories();
      setIsModalOpen(false);
      setFormData({ name: '', imageURI: '' });
      setEditingCategory(null);
    } catch (err) {
      console.error('Грешка при запазване на категория:', err);
      setError(err instanceof Error ? err.message : 'Неуспешно запазване на категория');
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({ name: '', imageURI: '' });
    setError('');
    setValidationErrors({});
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({ 
      name: category.name,
      imageURI: category.imageURI || ''
    });
    setError('');
    setValidationErrors({});
    setIsModalOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await fetch(`https://sportzone-api.onrender.com/api/Categories/${categoryToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Неуспешно изтриване на категория');
      }

      await fetchCategories();
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      console.error('Грешка при изтриване на категория:', err);
      setError('Неуспешно изтриване на категория');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Управление на категории</h1>
        <button
          onClick={handleAddCategory}
          className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Добави категория
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Име
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {category.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="text-white bg-yellow-600 hover:bg-yellow-700 p-1.5 rounded-md mr-2"
                    title="Редактиране"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(category)}
                    className="text-white bg-red-600 hover:bg-red-700 p-1.5 rounded-md"
                    title="Изтрий"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Редактиране на категория' : 'Добавяне на категория'}
            </h2>
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Име
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                    validationErrors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL на изображение
                </label>
                <input
                  type="url"
                  name="imageURI"
                  value={formData.imageURI}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                    validationErrors.imageURI ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {validationErrors.imageURI && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.imageURI}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCategory(null);
                    setFormData({ name: '', imageURI: '' });
                    setValidationErrors({});
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Отказ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
                >
                  {editingCategory ? 'Запази' : 'Добави'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Потвърждение за изтриване</h2>
            <p className="mb-6 text-gray-600">
              Сигурни ли сте, че искате да изтриете категорията "{categoryToDelete?.name}"?
              {categoryToDelete && categoryToDelete.productCount > 0 && (
                <span className="block mt-2 text-red-600">
                  Внимание: Тази категория съдържа {categoryToDelete.productCount} продукта(и).
                </span>
              )}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Отказ
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Изтрий
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories; 