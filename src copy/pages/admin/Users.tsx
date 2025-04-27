import { useState, useEffect } from 'react';
import { EyeIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface User {
  id: string;
  names: string;
  email: string;
  role: string;
  phone: string;
  password: string;
}

interface ValidationErrors {
  names?: string;
  email?: string;
  phone?: string;
  newPassword?: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ 
    names: '', 
    email: '', 
    phone: '',
    newPassword: '' 
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://sportzone-api.onrender.com/api/Users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Неуспешно зареждане на потребители');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Грешка при зареждане на потребители:', err);
      setError('Неуспешно зареждане на потребители');
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({ 
      names: user.names, 
      email: user.email, 
      phone: user.phone || '',
      newPassword: '' 
    });
    setIsModalOpen(true);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Names validation
    if (!editFormData.names.trim()) {
      errors.names = 'Името е задължително';
    } else if (editFormData.names.length < 2) {
      errors.names = 'Името трябва да е поне 2 символа';
    } else if (editFormData.names.length > 50) {
      errors.names = 'Името не може да е по-дълго от 50 символа';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editFormData.email.trim()) {
      errors.email = 'Имейлът е задължителен';
    } else if (!emailRegex.test(editFormData.email)) {
      errors.email = 'Моля, въведете валиден имейл адрес';
    } else if (users.some(user => 
      user.email.toLowerCase() === editFormData.email.toLowerCase() && 
      user.id !== selectedUser?.id
    )) {
      errors.email = 'Потребител с този имейл вече съществува';
    }

    // Phone validation (optional)
    if (editFormData.phone.trim()) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(editFormData.phone.trim())) {
        errors.phone = 'Моля, въведете валиден телефонен номер (10 цифри)';
      }
    }

    // Password validation (required for new users, optional for editing)
    if (!selectedUser && !editFormData.newPassword) {
      errors.newPassword = 'Паролата е задължителна за нови потребители';
    } else if (editFormData.newPassword) {
      if (editFormData.newPassword.length < 6) {
        errors.newPassword = 'Паролата трябва да е поне 6 символа';
      } else if (editFormData.newPassword.length > 100) {
        errors.newPassword = 'Паролата не може да е по-дълга от 100 символа';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      const url = selectedUser 
        ? `https://sportzone-api.onrender.com/api/Users`
        : 'https://sportzone-api.onrender.com/api/Users';

      const response = await fetch(url, {
        method: selectedUser ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(selectedUser ? {
          id: selectedUser.id,
          email: editFormData.email,
          password: editFormData.newPassword || "123456",
          names: editFormData.names,
          phone: editFormData.phone,
        } : {
          email: editFormData.email,
          password: editFormData.newPassword,
          names: editFormData.names,
          phone: editFormData.phone,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Неуспешно запазване на потребител');
      }

      await fetchUsers();
      setIsModalOpen(false);
      setEditFormData({ 
        names: '', 
        email: '', 
        phone: '',
        newPassword: '' 
      });
      setValidationErrors({});
      setSelectedUser(null);
    } catch (err) {
      console.error('Грешка при запазване на потребител:', err);
      setError(err instanceof Error ? err.message : 'Неуспешно запазване на потребител');
    }
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`https://sportzone-api.onrender.com/api/Users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Неуспешно изтриване на потребител');
      }

      await fetchUsers();
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Грешка при изтриване на потребител:', err);
      setError('Неуспешно изтриване на потребител');
    }
  };

  const handleToggleRole = async (userId: string) => {
    try {
      const currentUser = users.find(u => u.id === userId);
      if (!currentUser) return;

      const endpoint = currentUser.role === 'Admin' 
        ? 'https://sportzone-api.onrender.com/api/Users/demote-to-registered-customer'
        : 'https://sportzone-api.onrender.com/api/Users/promote-to-admin';

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Неуспешна промяна на роля');
      }

      await fetchUsers();
      if (selectedUser?.id === userId) {
        const updatedUser = users.find(u => u.id === userId);
        if (updatedUser) {
          setSelectedUser(updatedUser);
        }
      }
    } catch (err) {
      console.error('Грешка при промяна на роля:', err);
      setError(err instanceof Error ? err.message : 'Неуспешна промяна на роля');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Управление на потребители</h1>
        <button
          onClick={() => {
            setSelectedUser(null);
            setEditFormData({ 
              names: '', 
              email: '', 
              phone: '',
              newPassword: '' 
            });
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:text-gray-900 hover:bg-primary-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Добави потребител
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
                Имейл
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Телефон
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Роля
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.names}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.phone || 'Няма въведен'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleRole(user.id)}
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                    } hover:bg-opacity-75 transition-colors`}
                  >
                    {user.role === 'Admin' ? 'Администратор' : 'Потребител'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      handleViewUser(user);
                      handleEditClick();
                    }}
                    className="text-white bg-yellow-600 hover:bg-yellow-700 p-1.5 rounded-md mr-2"
                    title="Редактиране"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(user)}
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

      {/* Edit/View Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg p-3 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
              {selectedUser ? 'Редактиране на потребител' : 'Добавяне на потребител'}
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <form onSubmit={handleUpdateUser} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    Име
                  </label>
                  <input
                    type="text"
                    name="names"
                    value={editFormData.names}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 text-xs sm:text-sm ${
                      validationErrors.names ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.names && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.names}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    Имейл
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 text-xs sm:text-sm ${
                      validationErrors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 text-xs sm:text-sm ${
                      validationErrors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0888123456"
                  />
                  {validationErrors.phone && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    {selectedUser ? 'Нова парола (незадължително)' : 'Парола'}
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={editFormData.newPassword}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 text-xs sm:text-sm ${
                      validationErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.newPassword && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.newPassword}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-2 sm:space-x-3 mt-4 sm:mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedUser(null);
                      setEditFormData({ 
                        names: '', 
                        email: '', 
                        phone: '',
                        newPassword: '' 
                      });
                    }}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-xs sm:text-sm"
                  >
                    Затвори
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary-500 text-white rounded-md hover:text-gray-900 hover:bg-primary-600 text-xs sm:text-sm"
                  >
                    {selectedUser ? 'Запази' : 'Добави'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg p-3 sm:p-6 max-w-md w-full">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Потвърждение за изтриване</h2>
            <p className="mb-4 sm:mb-6 text-gray-600 text-xs sm:text-sm">
              Сигурни ли сте, че искате да изтриете потребителя "{selectedUser.names}"?
            </p>
            <div className="flex justify-end space-x-2 sm:space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-xs sm:text-sm"
              >
                Отказ
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs sm:text-sm"
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

export default AdminUsers; 