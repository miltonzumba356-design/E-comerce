import { useCatalog } from '../contexts/CatalogContext';
import { ProductGrid } from './ProductGrid';

export function FeaturedProducts() {
  const { products, isLoading } = useCatalog();
  const featured = products.slice(0, 8);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl mb-4">Produtos em Destaque</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Confira nossa seleção especial de produtos para todos os estilos e ocasiões
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : (
          <ProductGrid products={featured} emptyMessage="Nenhum produto cadastrado ainda." />
        )}
      </div>
    </section>
  );
}
