import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';
import { useCatalog } from '../contexts/CatalogContext';
import { useCurrency } from '../hooks/useCurrency';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const { products } = useCatalog();
  const { format } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category_detail?.name?.toLowerCase().includes(query)
    );
  }, [searchQuery, products]);

  const clearSearch = () => setSearchQuery('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Buscar Produtos</DialogTitle>
          <DialogDescription>Pesquise produtos por nome ou categoria</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Busque por produtos, categorias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto mt-4">
          {searchQuery === '' ? (
            <div className="text-center py-12 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Digite algo para buscar produtos</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Nenhum produto encontrado para "{searchQuery}"</p>
              <p className="text-sm mt-2">Tente buscar por outros termos</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                {searchResults.length}{' '}
                {searchResults.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              </p>

              {searchResults.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
                >
                  <ImageWithFallback
                    src={product.image || undefined}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h4 className="mb-1">{product.name}</h4>
                    <Badge variant="outline" className="text-xs mb-2">
                      {product.category_detail?.name}
                    </Badge>
                    <p className="text-lg text-gray-900">{format(product.price)}</p>
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
