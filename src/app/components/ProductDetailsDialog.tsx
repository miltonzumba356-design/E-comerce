import { Heart, ShoppingBag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useShop } from './ShopContext';
import { useCurrency } from '../hooks/useCurrency';
import type { Product } from '../services/api';

interface ProductDetailsDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=60';

export function ProductDetailsDialog({ product, open, onOpenChange }: ProductDetailsDialogProps) {
  const { addToCart, toggleFavorite, isFavorite } = useShop();
  const { format } = useCurrency();

  if (!product) return null;

  const specs = [
    { label: 'Marca', value: product.brand },
    { label: 'Cor', value: product.color },
    { label: 'Material', value: product.material },
    { label: 'Peso', value: product.weight },
    { label: 'Dimensões', value: product.dimensions },
  ].filter((spec) => spec.value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            {product.category_detail?.name || 'Detalhes do produto'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
            <ImageWithFallback
              src={product.image || FALLBACK_IMAGE}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-4">
            {product.category_detail?.name && (
              <Badge variant="outline" className="w-fit">
                {product.category_detail.name}
              </Badge>
            )}

            <p className="text-2xl font-semibold">{format(product.price)}</p>

            {product.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
            )}

            {specs.length > 0 && (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {specs.map((spec) => (
                  <div key={spec.label}>
                    <dt className="text-muted-foreground">{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="flex gap-2 mt-auto pt-2">
              <Button className="flex-1" onClick={() => addToCart(product, 1)}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                Adicionar ao Carrinho
              </Button>
              <Button variant="outline" size="icon" onClick={() => toggleFavorite(product.id)}>
                <Heart className={`h-5 w-5 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
