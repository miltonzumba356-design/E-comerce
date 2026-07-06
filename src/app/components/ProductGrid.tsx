import { useState } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProductDetailsDialog } from './ProductDetailsDialog';
import { useShop } from './ShopContext';
import { useCurrency } from '../hooks/useCurrency';
import type { Product } from '../services/api';

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=60';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleFavorite, isFavorite } = useShop();
  const { format } = useCurrency();
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <>
      <div
        className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => setDetailsOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setDetailsOpen(true);
          }
        }}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          <ImageWithFallback
            src={product.image || FALLBACK_IMAGE}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(product.id);
            }}
          >
            <Heart className={`h-5 w-5 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>

        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{product.category_detail?.name}</p>
          <h3 className="mb-2 line-clamp-1 font-medium">{product.name}</h3>
          <p className="mb-3 font-semibold">{format(product.price)}</p>

          <Button
            className="w-full"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1);
            }}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Adicionar ao Carrinho
          </Button>
        </div>
      </div>

      <ProductDetailsDialog product={product} open={detailsOpen} onOpenChange={setDetailsOpen} />
    </>
  );
}

export function ProductGrid({ products, emptyMessage }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage || 'Nenhum produto encontrado.'}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
