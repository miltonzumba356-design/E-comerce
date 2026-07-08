import { useNavigate } from 'react-router';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
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
  const navigate = useNavigate();

  const openDetails = () => navigate(`/produto/${product.slug}`);

  const price = parseFloat(product.price);
  const originalPrice = product.original_price ? parseFloat(product.original_price) : null;
  const discountPercent =
    originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : null;

  return (
    <div
      className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={openDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDetails();
        }
      }}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <ImageWithFallback
          src={product.image || FALLBACK_IMAGE}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {discountPercent !== null && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">-{discountPercent}%</Badge>
        )}
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
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-xs text-muted-foreground truncate">{product.category_detail?.name}</p>
          {typeof product.rating === 'number' && (
            <span className="flex items-center gap-0.5 text-xs shrink-0">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>
        <h3 className="mb-2 line-clamp-1 font-medium">{product.name}</h3>
        <p className="mb-3 font-semibold flex items-center gap-2">
          {format(product.price)}
          {originalPrice && originalPrice > price && (
            <span className="text-sm font-normal text-muted-foreground line-through">{format(originalPrice)}</span>
          )}
        </p>

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
