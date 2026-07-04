import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { productsAPI, categoriesAPI, Product, Category } from '../services/api';

interface CatalogContextType {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  refetch: () => Promise<void>;
  getProductsByCategory: (categorySlug: string) => Product[];
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll(1, 100),
        categoriesAPI.getAll(1, 100),
      ]);
      setProducts(productsRes.results.filter((p) => p.is_active));
      setCategories(categoriesRes.results);
    } catch (error) {
      console.error('Erro ao carregar catálogo:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getProductsByCategory = (categorySlug: string) => {
    return products.filter((p) => p.category === categorySlug || p.category_detail?.slug === categorySlug);
  };

  return (
    <CatalogContext.Provider
      value={{ products, categories, isLoading, refetch: load, getProductsByCategory }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog deve ser usado dentro de um CatalogProvider');
  }
  return context;
}
