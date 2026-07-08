import { createBrowserRouter, Navigate } from 'react-router';
import { ReactNode } from 'react';
import { useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductsManagement from './pages/admin/ProductsManagement';
import InventoryManagement from './pages/admin/InventoryManagement';
import OrdersManagement from './pages/admin/OrdersManagement';
import CustomersManagement from './pages/admin/CustomersManagement';
import ReportsPage from './pages/admin/ReportsPage';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground">Página não encontrada</p>
    </div>
  </div>
);

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: HomePage,
  },
  {
    path: '/produto/:slug',
    Component: ProductDetailPage,
  },
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/register',
    Component: RegisterPage,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <CustomerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: 'products',
        Component: ProductsManagement,
      },
      {
        path: 'inventory',
        Component: InventoryManagement,
      },
      {
        path: 'orders',
        Component: OrdersManagement,
      },
      {
        path: 'customers',
        Component: CustomersManagement,
      },
      {
        path: 'reports',
        Component: ReportsPage,
      },
    ],
  },
  {
    path: '*',
    Component: NotFound,
  },
]);
