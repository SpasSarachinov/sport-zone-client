import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import AdminPanel from '../pages/admin/AdminPanel';
import AdminProducts from '../pages/admin/Products';
import AdminCategories from '../pages/admin/Categories';
import AdminOrders from '../pages/admin/Orders';
import AdminUsers from '../pages/admin/Users';
import Layout from '../components/layout/Layout';
import AdminRoute from './AdminRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        ),
        children: [
          {
            path: 'products',
            element: <AdminProducts />,
          },
          {
            path: 'categories',
            element: <AdminCategories />,
          },
          {
            path: 'orders',
            element: <AdminOrders />,
          },
          {
            path: 'users',
            element: <AdminUsers />,
          },
        ],
      },
    ],
  },
]); 