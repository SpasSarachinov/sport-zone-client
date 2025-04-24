import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser, setToken } from '../../store/slices/authSlice';
import { decodeJWT } from '../../utils/jwtUtils';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login with:', { email, password: '***' });
      
      const response = await fetch('https://sportzone-api.onrender.com/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Server response:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.message || data.title || 'Грешка при влизане');
      }

      if (!data.accessToken) {
        console.error('No access token received in response:', data);
        throw new Error('No authentication token received');
      }

      // Decode the JWT token to get user information
      const decodedToken = decodeJWT(data.accessToken);
      console.log('Login response data:', data);
      console.log('Decoded token:', decodedToken);

      const role = decodedToken?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      console.log('Role from token:', role);

      dispatch(setToken(data.accessToken));
      dispatch(setUser({
        id: data.id,
        email: data.email,
        name: data.names,
        role: role || 'User',
      }));

      // Only redirect to admin panel if user is admin
      if (role === "Admin") {
        navigate('/admin/products');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Грешка при влизане');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-dark-200 p-8 rounded-lg shadow-xl">
        <div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-dark-700">
            Вход в акаунта
          </h2>
          <p className="mt-2 text-center text-sm text-dark-700">
            Нямате акаунт?{' '}
            <Link
              to="/register"
              className="font-medium text-primary-400 hover:text-primary-300"
            >
              Регистрирайте се тук
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-dark-300 rounded-md bg-dark-300 text-dark-900 placeholder-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Въведете парола"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
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
                  Влизане...
                </span>
              ) : (
                'Вход'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 