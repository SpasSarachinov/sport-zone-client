import { Link, Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const AdminPanel = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  console.log('Current user:', user); // Debug log

  // Redirect non-admin users to home page
  if (user?.role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-secondary-900 text-white p-4">
          <h2 className="text-xl font-bold mb-6">Административен панел</h2>
          <nav className="space-y-2">
            <Link 
              to="/admin/products" 
              className="block px-4 py-2 rounded hover:bg-secondary-800 transition-colors"
            >
              Продукти
            </Link>
            <Link 
              to="/admin/orders" 
              className="block px-4 py-2 rounded hover:bg-secondary-800 transition-colors"
            >
              Поръчки
            </Link>
            <Link 
              to="/admin/categories" 
              className="block px-4 py-2 rounded hover:bg-secondary-800 transition-colors"
            >
              Категории
            </Link>
            <Link 
              to="/admin/users" 
              className="block px-4 py-2 rounded hover:bg-secondary-800 transition-colors"
            >
              Потребители
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminPanel; 