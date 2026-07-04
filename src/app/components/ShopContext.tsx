import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { toast } from 'sonner';
import { cartAPI, Product } from '../services/api';
import { formatCurrency } from '../utils/currency';
import { useAuth } from '../contexts/AuthContext';

export interface CartLine {
  cartItemId?: number; // presente apenas quando sincronizado com o carrinho do servidor
  product: Product;
  quantity: number;
}

interface ShopContextType {
  cart: CartLine[];
  favorites: number[];
  isCartLoading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  toggleFavorite: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
  getCartTotal: () => string;
  getCartItemsCount: () => number;
  clearCart: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const favoritesKey = (userId?: number) => `favorites_${userId ?? 'guest'}`;

export function ShopProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const wasAuthenticated = useRef(false);

  // Favoritos: 100% local (a API não expõe wishlist), por usuário.
  useEffect(() => {
    const stored = localStorage.getItem(favoritesKey(user?.id));
    setFavorites(stored ? JSON.parse(stored) : []);
  }, [user?.id]);

  const persistFavorites = (ids: number[]) => {
    setFavorites(ids);
    localStorage.setItem(favoritesKey(user?.id), JSON.stringify(ids));
  };

  const loadServerCart = async () => {
    setIsCartLoading(true);
    try {
      const serverCart = await cartAPI.get();
      setCart(
        serverCart.items.map((item) => ({
          cartItemId: item.id,
          product: item.product_detail,
          quantity: item.quantity,
        }))
      );
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    } finally {
      setIsCartLoading(false);
    }
  };

  // Ao logar, sincroniza itens do carrinho de visitante com o carrinho do servidor.
  useEffect(() => {
    const sync = async () => {
      if (isAuthenticated && !wasAuthenticated.current) {
        const guestItems = cart.filter((line) => !line.cartItemId);
        setIsCartLoading(true);
        try {
          for (const line of guestItems) {
            await cartAPI.addItem(line.product.id, line.quantity);
          }
        } catch (error) {
          console.error('Erro ao sincronizar carrinho:', error);
        }
        await loadServerCart();
      } else if (!isAuthenticated && wasAuthenticated.current) {
        setCart([]);
      }
      wasAuthenticated.current = isAuthenticated;
    };
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const addToCart = async (product: Product, quantity = 1) => {
    if (isAuthenticated) {
      setIsCartLoading(true);
      try {
        const serverCart = await cartAPI.addItem(product.id, quantity);
        setCart(
          serverCart.items.map((item) => ({
            cartItemId: item.id,
            product: item.product_detail,
            quantity: item.quantity,
          }))
        );
        toast.success('Produto adicionado ao carrinho!');
      } catch (error: any) {
        toast.error(error.message || 'Erro ao adicionar ao carrinho');
      } finally {
        setIsCartLoading(false);
      }
      return;
    }

    setCart((prev) => {
      const existing = prev.find((line) => line.product.id === product.id);
      if (existing) {
        return prev.map((line) =>
          line.product.id === product.id ? { ...line, quantity: line.quantity + quantity } : line
        );
      }
      return [...prev, { product, quantity }];
    });
    toast.success('Produto adicionado ao carrinho!');
  };

  const removeFromCart = async (productId: number) => {
    const line = cart.find((l) => l.product.id === productId);
    if (isAuthenticated && line?.cartItemId) {
      setIsCartLoading(true);
      try {
        await cartAPI.removeItem(line.cartItemId);
        setCart((prev) => prev.filter((l) => l.product.id !== productId));
        toast.info('Produto removido do carrinho');
      } catch (error: any) {
        toast.error(error.message || 'Erro ao remover produto');
      } finally {
        setIsCartLoading(false);
      }
      return;
    }

    setCart((prev) => prev.filter((l) => l.product.id !== productId));
    toast.info('Produto removido do carrinho');
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    const line = cart.find((l) => l.product.id === productId);
    if (isAuthenticated && line?.cartItemId) {
      setIsCartLoading(true);
      try {
        const serverCart = await cartAPI.updateQuantity(line.cartItemId, quantity);
        setCart(
          serverCart.items.map((item) => ({
            cartItemId: item.id,
            product: item.product_detail,
            quantity: item.quantity,
          }))
        );
      } catch (error: any) {
        toast.error(error.message || 'Erro ao atualizar quantidade');
      } finally {
        setIsCartLoading(false);
      }
      return;
    }

    setCart((prev) => prev.map((l) => (l.product.id === productId ? { ...l, quantity } : l)));
  };

  const toggleFavorite = (productId: number) => {
    if (favorites.includes(productId)) {
      persistFavorites(favorites.filter((id) => id !== productId));
      toast.info('Removido dos favoritos');
    } else {
      persistFavorites([...favorites, productId]);
      toast.success('Adicionado aos favoritos!');
    }
  };

  const isFavorite = (productId: number) => favorites.includes(productId);

  const getCartTotal = () => {
    const total = cart.reduce((sum, line) => sum + parseFloat(line.product.price) * line.quantity, 0);
    return formatCurrency(total);
  };

  const getCartItemsCount = () => cart.reduce((sum, line) => sum + line.quantity, 0);

  const clearCart = async () => {
    if (isAuthenticated) {
      setIsCartLoading(true);
      try {
        await cartAPI.clear();
      } catch (error) {
        console.error('Erro ao limpar carrinho:', error);
      } finally {
        setIsCartLoading(false);
      }
    }
    setCart([]);
    toast.success('Carrinho limpo!');
  };

  return (
    <ShopContext.Provider
      value={{
        cart,
        favorites,
        isCartLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleFavorite,
        isFavorite,
        getCartTotal,
        getCartItemsCount,
        clearCart,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
