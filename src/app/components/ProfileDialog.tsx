import { useEffect, useState } from 'react';
import { User, LogOut, ShieldCheck, Package, Heart, ShoppingBag, LogIn } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useAuth } from '../contexts/AuthContext';
import { useShop } from './ShopContext';
import { ordersAPI } from '../services/api';
import { useNavigate } from 'react-router';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { favorites, cart } = useShop();
  const navigate = useNavigate();
  const [orderCount, setOrderCount] = useState<number | null>(null);

  useEffect(() => {
    if (open && isAuthenticated) {
      ordersAPI
        .getAll()
        .then((data) => setOrderCount(data.count))
        .catch(() => setOrderCount(null));
    }
  }, [open, isAuthenticated]);

  const handleLogout = () => {
    logout();
    onOpenChange(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  // Se não estiver autenticado, mostrar opções de login/registro
  if (!isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Minha Conta</DialogTitle>
            <DialogDescription>
              Entre ou crie uma conta para acessar seu perfil
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => handleNavigation('/login')}
            >
              <LogIn className="mr-2 h-5 w-5" />
              Entrar
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full" 
              size="lg"
              onClick={() => handleNavigation('/register')}
            >
              Criar Conta
            </Button>

            <Separator />

            <div className="text-sm text-center text-muted-foreground">
              <p>Ao entrar você terá acesso a:</p>
              <ul className="mt-2 space-y-1">
                <li>• Histórico de pedidos</li>
                <li>• Lista de favoritos</li>
                <li>• Dados salvos para compra rápida</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Usuário autenticado
  const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Meu Perfil</DialogTitle>
          <DialogDescription>
            Gerencie sua conta e veja suas informações
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Avatar e Informações Básicas */}
          <div className="flex items-center gap-6 pb-6 border-b">
            <Avatar className="w-24 h-24 bg-primary">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-2xl mb-1">
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-muted-foreground">{user.email}</p>
              {user.phone && (
                <p className="text-sm text-muted-foreground mt-1">{user.phone}</p>
              )}
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center">
              <Package className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl mb-1">{orderCount ?? '-'}</p>
              <p className="text-sm text-gray-600">Pedidos</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg text-center">
              <Heart className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <p className="text-2xl mb-1">{favorites.length}</p>
              <p className="text-sm text-gray-600">Favoritos</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center">
              <ShoppingBag className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl mb-1">{cart.length}</p>
              <p className="text-sm text-gray-600">No Carrinho</p>
            </div>
          </div>

          <Separator />

          {/* Ações */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold mb-3">Ações Rápidas</h4>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleNavigation('/dashboard')}
            >
              <User className="mr-2 h-5 w-5" />
              Meus Pedidos
            </Button>

            {user.role === 'admin' && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleNavigation('/admin')}
              >
                <ShieldCheck className="mr-2 h-5 w-5" />
                Painel Administrativo
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
