import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Store, Loader2 } from 'lucide-react';
import { useShop } from './ShopContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Separator } from './ui/separator';
import { useCurrency } from '../hooks/useCurrency';
import { toast } from 'sonner';
import { useState } from 'react';
import { CheckoutDialog } from './CheckoutDialog';

interface ShoppingCartSheetProps {
  triggerClassName?: string;
}

export function ShoppingCartSheet({ triggerClassName }: ShoppingCartSheetProps = {}) {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartItemsCount, clearCart, isCartLoading } =
    useShop();
  const { format } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Seu carrinho está vazio!');
      return;
    }

    setCheckoutOpen(true);
  };

  const handleCheckoutComplete = () => {
    setIsOpen(false);
  };

  const handleContinueShopping = () => {
    setIsOpen(false);
    toast.info('Continue navegando e adicionando produtos!');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className={`relative ${triggerClassName || ''}`}>
          <ShoppingCart className="h-5 w-5" />
          {getCartItemsCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {getCartItemsCount()}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Carrinho de Compras</SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-4">
          {isCartLoading && cart.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Seu carrinho está vazio</p>
              <p className="text-sm text-gray-400 mt-2">
                Adicione produtos para começar suas compras
              </p>
            </div>
          ) : (
            <>
              {cart.map((line) => (
                <div key={line.product.id} className="flex gap-4 p-4 border rounded-lg">
                  <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                    <ImageWithFallback
                      src={line.product.image || undefined}
                      alt={line.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="line-clamp-1 mb-1">{line.product.name}</h4>
                    <p className="mb-2">{format(line.product.price)}</p>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={isCartLoading}
                        onClick={() => updateQuantity(line.product.id, line.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{line.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={isCartLoading}
                        onClick={() => updateQuantity(line.product.id, line.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    disabled={isCartLoading}
                    onClick={() => removeFromCart(line.product.id)}
                  >
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
              ))}

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg">Total:</span>
                  <span className="text-2xl">{getCartTotal()}</span>
                </div>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isCartLoading}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Finalizar Compra
                </Button>

                <Button variant="outline" className="w-full" onClick={handleContinueShopping}>
                  <Store className="h-4 w-4 mr-2" />
                  Continuar Comprando
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        onCheckoutComplete={handleCheckoutComplete}
        total={getCartTotal()}
      />
    </Sheet>
  );
}
