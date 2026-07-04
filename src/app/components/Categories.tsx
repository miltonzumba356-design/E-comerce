import { useState, useEffect } from 'react';
import { useCatalog } from '../contexts/CatalogContext';
import { ProductGrid } from './ProductGrid';

export function Categories() {
  const { categories, products, getProductsByCategory, isLoading } = useCatalog();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!activeSlug && categories.length > 0) {
      setActiveSlug(categories[0].slug);
    }
  }, [categories, activeSlug]);

  if (isLoading) {
    return (
      <section className="py-16 bg-white" id="colecao">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-16 bg-white" id="colecao">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          Nenhuma categoria cadastrada ainda.
        </div>
      </section>
    );
  }

  const activeProducts = activeSlug ? getProductsByCategory(activeSlug) : products;

  return (
    <section className="py-8 bg-white" id="colecao">
      <div className="container mx-auto px-4">
        {/* Tabs de Navegação — geradas dinamicamente a partir das categorias reais */}
        <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.slug}
              id={category.slug}
              onClick={() => setActiveSlug(category.slug)}
              className={`px-6 sm:px-8 py-3 rounded-full transition-all whitespace-nowrap ${
                activeSlug === category.slug
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="mt-8">
          <ProductGrid
            products={activeProducts}
            emptyMessage="Nenhum produto cadastrado nesta categoria ainda."
          />
        </div>
      </div>
    </section>
  );
}
