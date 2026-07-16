import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Store, Loader2 } from 'lucide-react';
import { useShop } from './ShopContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useCurrency } from '../hooks/useCurrency';
import { toast } from 'sonner';
import { useState } from 'react';
import { CheckoutDialog } from './CheckoutDialog';

interface ShoppingCartSheetProps {
  triggerClassName?: string;
}

export function ShoppingCartSheet({ triggerClassName }: ShoppingCartSheetProps = {}) {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartItemsCount, isCartLoading } = useShop();
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

  const itemsCount = getCartItemsCount();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className={`relative ${triggerClassName || ''}`}>
          <ShoppingCart className="h-5 w-5" />
          {itemsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
              {itemsCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>
            Carrinho {itemsCount > 0 && <span className="text-muted-foreground font-normal">({itemsCount})</span>}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-4">
          {isCartLoading && cart.length === 0 ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <ShoppingCart className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-medium">Seu carrinho está vazio</p>
              <p className="text-sm text-muted-foreground mt-1">Adicione produtos para começar suas compras</p>
            </div>
          ) : (
            <div className="py-4 space-y-3">
              {cart.map((line) => (
                <div key={line.product.id} className="flex gap-4 p-3 rounded-2xl border bg-card">
                  <div className="w-20 h-20 shrink-0 bg-muted rounded-xl overflow-hidden">
                    <ImageWithFallback
                      src={line.product.image || undefined}
                      alt={line.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <h4 className="line-clamp-1 text-sm font-medium">{line.product.name}</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">{format(line.product.price)}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border rounded-full">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          disabled={isCartLoading}
                          onClick={() => updateQuantity(line.product.id, line.quantity - 1)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-6 text-center text-sm">{line.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          disabled={isCartLoading}
                          onClick={() => updateQuantity(line.product.id, line.quantity + 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        disabled={isCartLoading}
                        onClick={() => removeFromCart(line.product.id)}
                        aria-label="Remover item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <SheetFooter className="border-t gap-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total</span>
              <span className="text-xl font-semibold">{getCartTotal()}</span>
            </div>

            <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isCartLoading}>
              <CreditCard className="h-5 w-5 mr-2" />
              Finalizar Compra
            </Button>

            <Button variant="outline" className="w-full" onClick={handleContinueShopping}>
              <Store className="h-4 w-4 mr-2" />
              Continuar Comprando
            </Button>
          </SheetFooter>
        )}
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
