import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { useShop } from './ShopContext';
import { useCatalog } from '../contexts/CatalogContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';
import { useCurrency } from '../hooks/useCurrency';

interface FavoritesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FavoritesDialog({ open, onOpenChange }: FavoritesDialogProps) {
  const { favorites, toggleFavorite, addToCart } = useShop();
  const { products } = useCatalog();
  const { format } = useCurrency();

  const favoriteProducts = products.filter((product) => favorites.includes(product.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            Meus Favoritos ({favorites.length})
          </DialogTitle>
          <DialogDescription>
            Gerencie seus produtos favoritos e adicione ao carrinho
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {favoriteProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">Nenhum produto favorito ainda</p>
              <p className="text-sm">Adicione produtos aos favoritos clicando no ícone de coração</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoriteProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4 p-4">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <ImageWithFallback
                        src={product.image || undefined}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h4 className="text-sm mb-1">{product.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {product.category_detail?.name}
                        </Badge>
                      </div>
                      <p className="text-lg">{format(product.price)}</p>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => addToCart(product, 1)}
                          size="sm"
                          className="flex-1 text-xs"
                        >
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Adicionar
                        </Button>
                        <Button
                          onClick={() => toggleFavorite(product.id)}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
