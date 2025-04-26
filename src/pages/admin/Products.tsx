import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Add type assertion for ReactQuill
const QuillEditor = ReactQuill as any;

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  regularPrice: number;
  quantity: number;
  imageUrl: string;
  rating: number;
  discountPercentage: number;
  discountedPrice: number;
  reviews: Array<{
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  primaryImageUrl: string;
  secondaryImages: Array<{ id: null; uri: string }>;
}

interface FormData {
  name: string;
  description: string;
  categoryId: string;
  regularPrice: string;
  discountedPrice: string;
  stock: string;
  discountPercentage: string;
  primaryImageUrl: string;
  secondaryImages: string[];
}

interface ValidationErrors {
  name?: string;
  description?: string;
  categoryId?: string;
  regularPrice?: string;
  discountedPrice?: string;
  stock?: string;
  discountPercentage?: string;
  primaryImageUrl?: string;
  secondaryImages?: string[];
}

const AdminProducts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    categoryId: '',
    regularPrice: '',
    discountedPrice: '',
    stock: '',
    discountPercentage: '0',
    primaryImageUrl: '',
    secondaryImages: ['']
  });
  const [error, setError] = useState('');
  const { token } = useSelector((state: RootState) => state.auth);
  const [categories, setCategories] = useState<Category[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    fetchProducts();
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

  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
      const response = await fetch('https://sportzone-api.onrender.com/api/Products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Неуспешно зареждане на продукти');
      }
      
      const data = await response.json();
      console.log('Products API response:', data);

      // Extract items array from the response
      const productsArray = data.items || [];
      
      setProducts(productsArray);
    } catch (err) {
      console.error('Грешка при зареждане на продукти:', err);
      setError('Неуспешно зареждане на продукти');
      setProducts([]);
    }
  };

  useEffect(() => {
    console.log('Current products state:', products);
  }, [products]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDescriptionChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      description: content
    }));
  };

  const handleSecondaryImageChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      secondaryImages: prev.secondaryImages.map((url, i) => 
        i === index ? value : url
      )
    }));
  };

  const addSecondaryImageField = () => {
    setFormData(prev => ({
      ...prev,
      secondaryImages: [...prev.secondaryImages, '']
    }));
  };

  const removeSecondaryImageField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      secondaryImages: prev.secondaryImages.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Името е задължително';
    } else if (formData.name.length < 3) {
      errors.name = 'Името трябва да е поне 3 символа';
    } else if (formData.name.length > 50) {
      errors.name = 'Името не може да е по-дълго от 50 символа';
    }

    // Description validation
    if (!formData.description.trim()) {
      errors.description = 'Описанието е задължително';
    } else if (formData.description.length < 10) {
      errors.description = 'Описанието трябва да е поне 10 символа';
    }

    // Category validation
    if (!formData.categoryId) {
      errors.categoryId = 'Моля, изберете категория';
    }

    // Price validation
    const regularPriceNum = parseFloat(formData.regularPrice);
    if (!formData.regularPrice) {
      errors.regularPrice = 'Цената е задължителна';
    } else if (isNaN(regularPriceNum)) {
      errors.regularPrice = 'Моля, въведете валидна цена';
    } else if (regularPriceNum < 0) {
      errors.regularPrice = 'Цената не може да бъде отрицателна';
    } else if (regularPriceNum > 100000) {
      errors.regularPrice = 'Цената не може да надвишава 100,000';
    }

    // Stock validation
    const stockNum = parseInt(formData.stock);
    if (!formData.stock) {
      errors.stock = 'Количеството е задължително';
    } else if (isNaN(stockNum)) {
      errors.stock = 'Моля, въведете валидно количество';
    } else if (stockNum < 0) {
      errors.stock = 'Количеството не може да бъде отрицателно';
    } else if (stockNum > 10000) {
      errors.stock = 'Количеството не може да надвишава 10,000';
    }

    // Main image validation
    if (!formData.primaryImageUrl.trim()) {
      errors.primaryImageUrl = 'Основното изображение е задължително';
    } else {
      try {
        new URL(formData.primaryImageUrl);
      } catch {
        errors.primaryImageUrl = 'Моля, въведете валиден URL адрес';
      }
    }

    // Secondary images validation
    formData.secondaryImages.forEach((url, index) => {
      if (url.trim()) {
        try {
          new URL(url);
        } catch {
          if (!errors.secondaryImages) {
            errors.secondaryImages = [];
          }
          errors.secondaryImages[index] = 'Моля, въведете валиден URL адрес';
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        id: editingProduct?.id || '',
        title: formData.name,
        description: formData.description,
        primaryImageUrl: formData.primaryImageUrl,
        regularPrice: parseFloat(formData.regularPrice) || 0,
        discountPercentage: parseFloat(formData.discountPercentage) || 0,
        discountedPrice: parseFloat(formData.discountedPrice) || 0,
        quantity: parseInt(formData.stock) || 0,
        categoryId: formData.categoryId,
        secondaryImages: formData.secondaryImages
          .filter(url => url.trim() !== '')
          .map(url => ({ id: null, uri: url }))
      };

      // If editing and no new secondary images provided, keep the existing ones
      if (editingProduct && submitData.secondaryImages.length === 0) {
        submitData.secondaryImages = [{
          id: null,
          uri: ''
        }];
      }

      console.log('Submitting data:', submitData);
      
      const response = await fetch(`https://sportzone-api.onrender.com/api/Products`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Неуспешно запазване на продукт');
      }

      await fetchProducts();
      setIsModalOpen(false);
      setFormData({
        name: '',
        description: '',
        categoryId: '',
        regularPrice: '',
        discountedPrice: '',
        stock: '',
        discountPercentage: '0',
        primaryImageUrl: '',
        secondaryImages: ['']
      });
      setValidationErrors({});
      setEditingProduct(null);
    } catch (err) {
      console.error('Грешка при запазване на продукт:', err);
      setError(err instanceof Error ? err.message : 'Неуспешно запазване на продукт');
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      regularPrice: '',
      discountedPrice: '',
      stock: '',
      discountPercentage: '0',
      primaryImageUrl: '',
      secondaryImages: ['']
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.title || '',
      description: product.description || '',
      categoryId: product.categoryId || '',
      regularPrice: (product.regularPrice || 0).toString(),
      discountedPrice: (product.discountedPrice || 0).toString(),
      stock: (product.quantity || 0).toString(),
      discountPercentage: (product.discountPercentage || 0).toString(),
      primaryImageUrl: product.primaryImageUrl || '',
      secondaryImages: product.secondaryImages?.map(img => img.uri) || ['']
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`https://sportzone-api.onrender.com/api/Products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Неуспешно изтриване на продукт');
      }

      await fetchProducts();
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err) {
      console.error('Грешка при изтриване на продукт:', err);
      setError(err instanceof Error ? err.message : 'Неуспешно изтриване на продукт');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Управление на продукти</h1>
        <button
          onClick={handleAddProduct}
          className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:text-gray-900 hover:bg-primary-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Добави продукт
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Категория
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Цена
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Отстъпка
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Наличност
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(products || []).map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.title || ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {categories.find(c => c.id === product.categoryId)?.name || 'Неизвестна категория'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Intl.NumberFormat('bg-BG', { 
                    style: 'currency', 
                    currency: 'BGN',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }).format(product.discountedPrice || product.regularPrice || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.discountPercentage ? `${product.discountPercentage}%` : '0%'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.quantity || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="text-white bg-yellow-600 hover:bg-yellow-700 p-1.5 rounded-md mr-2"
                    title="Редактиране"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(product)}
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg p-3 sm:p-6 w-[80%] sm:w-[70%] md:w-[60%] lg:w-[50%] max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
              {editingProduct ? 'Редактиране на продукт' : 'Добавяне на продукт'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Категория
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                      validationErrors.categoryId ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Изберете категория</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.categoryId && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.categoryId}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <QuillEditor
                    theme="snow"
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    className={validationErrors.description ? 'border-red-300' : ''}
                  />
                  {validationErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Цена
                  </label>
                  <input
                    type="string"
                    name="regularPrice"
                    value={formData.regularPrice}
                    onChange={handleInputChange}
                    min="0"
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                      validationErrors.regularPrice ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.regularPrice && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.regularPrice}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Цена с отстъпка
                  </label>
                  <input
                    type="string"
                    name="discountedPrice"
                    value={formData.discountedPrice}
                    onChange={handleInputChange}
                    min="0"
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                      validationErrors.discountedPrice ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.discountedPrice && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.discountedPrice}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Наличност
                  </label>
                  <input
                    type="string"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                      validationErrors.stock ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.stock && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.stock}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Отстъпка (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  {validationErrors.discountPercentage && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.discountPercentage}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    URL на основно изображение
                  </label>
                  <input
                    type="url"
                    name="primaryImageUrl"
                    value={formData.primaryImageUrl}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                      validationErrors.primaryImageUrl ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.primaryImageUrl && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.primaryImageUrl}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      URL на допълнителни изображения
                    </label>
                    <button
                      type="button"
                      onClick={addSecondaryImageField}
                      className="text-sm text-white bg-primary-600 hover:text-gray-900 hover:bg-primary-700"
                    >
                      + Добави изображение
                    </button>
                  </div>
                  {formData.secondaryImages.map((url, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleSecondaryImageChange(index, e.target.value)}
                        placeholder="URL на допълнително изображение"
                        className={`flex-1 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                          validationErrors.secondaryImages?.[index] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {formData.secondaryImages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSecondaryImageField(index)}
                          className="text-white bg-red-600 hover:bg-red-700"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {validationErrors.secondaryImages?.some(error => error) && (
                    <p className="mt-1 text-sm text-red-600">Моля, въведете валидни URL адреси</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                    setFormData({
                      name: '',
                      description: '',
                      categoryId: '',
                      regularPrice: '',
                      discountedPrice: '',
                      stock: '',
                      discountPercentage: '0',
                      primaryImageUrl: '',
                      secondaryImages: ['']
                    });
                    setValidationErrors({});
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Отказ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:text-gray-900 hover:bg-primary-600"
                >
                  {editingProduct ? 'Запази' : 'Добави'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg p-3 sm:p-6 w-[95%] sm:w-[80%] md:w-[60%] lg:w-[40%]">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Потвърждение за изтриване</h2>
            <p className="mb-6 text-gray-600">
              Сигурни ли сте, че искате да изтриете продукта "{productToDelete.title}"?
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

export default AdminProducts; 