import { RouterProvider } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { CatalogProvider } from './contexts/CatalogContext';
import { ShopProvider } from './components/ShopContext';
import { Toaster } from './components/ui/sonner';
import { AiChatWidget } from './components/AiChatWidget';
import { router } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <CatalogProvider>
        <ShopProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" />
          <AiChatWidget />
        </ShopProvider>
      </CatalogProvider>
    </AuthProvider>
  );
}
