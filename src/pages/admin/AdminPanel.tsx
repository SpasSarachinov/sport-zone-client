import { Link, Outlet } from 'react-router-dom';

const AdminPanel = () => {
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
            <Link 
              to="/admin/orders" 
              className="block px-4 py-2 rounded hover:bg-secondary-800 transition-colors"
            >
              Поръчки
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