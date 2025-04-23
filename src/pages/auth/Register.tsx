import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser, setToken } from '../../store/slices/authSlice';
import TermsOfService from '../../components/modals/TermsOfService';

const Register = () => {
  const [formData, setFormData] = useState({
    names: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (type === 'checkbox' && name === 'acceptTerms') {
      setAcceptedTerms(checked);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!acceptedTerms) {
      setError('Моля, приемете общите условия, за да продължите.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Паролите не съвпадат.');
      return;
    }

    setIsLoading(true);

    try {
      const requestBody = {
        names: formData.names,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      };

      console.log('Sending registration request with data:', requestBody);

      const response = await fetch('/api/Auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (!response.ok) {
        // Handle validation errors
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
            .join('\n');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Грешка при регистрация');
      }

      // Save token to localStorage
      localStorage.setItem('token', data.token);
      
      // Dispatch token and user data to Redux store
      dispatch(setToken(data.token));
      dispatch(setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.names,
        role: data.user.role,
      }));

      // Redirect to home page
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Грешка при регистрация');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-dark-200 p-8 rounded-lg shadow-xl">
        <div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-dark-700">
            Създаване на акаунт
          </h2>
          <p className="mt-2 text-center text-sm text-dark-700">
            Вече имате акаунт?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-400 hover:text-primary-300"
            >
              Влезте тук
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="names" className="block text-sm font-medium text-dark-700 mb-2">
                Имена
              </label>
              <input
                id="names"
                name="names"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-dark-300 rounded-md bg-dark-300 text-dark-900 placeholder-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Въведете имена"
                value={formData.names}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-700 mb-2">
                Имейл адрес
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-dark-300 rounded-md bg-dark-300 text-dark-900 placeholder-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Въведете имейл адрес"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-dark-700 mb-2">
                Телефонен номер
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                autoComplete="phone"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-dark-300 rounded-md bg-dark-300 text-dark-900 placeholder-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Въведете телефонен номер"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-700 mb-2">
                Парола
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-dark-300 rounded-md bg-dark-300 text-dark-900 placeholder-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Въведете парола"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-700 mb-2">
                Потвърдете паролата
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-dark-300 rounded-md bg-dark-300 text-dark-900 placeholder-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Въведете паролата отново"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-dark-300 rounded bg-dark-300"
              checked={acceptedTerms}
              onChange={handleChange}
            />
            <label htmlFor="acceptTerms" className="ml-2 block text-sm text-dark-700">
              Прочетох и приемам{' '}
              <span
                onClick={() => setIsTermsOpen(true)}
                className="font-medium text-primary-400 hover:text-primary-300 cursor-pointer"
              >
                общите условия
              </span>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-dark-900 bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Регистрация...
                </span>
              ) : (
                'Регистрация'
              )}
            </button>
          </div>
        </form>
      </div>
      <TermsOfService isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
};

export default Register; 