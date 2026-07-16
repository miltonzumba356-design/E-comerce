import { useEffect, useState } from 'react';
import { User, LogOut, ShieldCheck, Package, Heart, ShoppingBag, LogIn, Pencil, Loader2, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useAuth } from '../contexts/AuthContext';
import { useShop } from './ShopContext';
import { ordersAPI } from '../services/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const { favorites, cart } = useShop();
  const navigate = useNavigate();
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', phone: '', address: '' });

  useEffect(() => {
    if (open && isAuthenticated) {
      ordersAPI
        .getAll()
        .then((data) => setOrderCount(data.count))
        .catch(() => setOrderCount(null));
    }
    if (!open) {
      setIsEditing(false);
    }
  }, [open, isAuthenticated]);

  const handleStartEdit = () => {
    if (user) {
      setEditForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile(editForm);
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

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
          {isEditing ? (
            <div className="space-y-4 pb-6 border-b">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-first-name">Nome</Label>
                  <Input
                    id="edit-first-name"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-last-name">Sobrenome</Label>
                  <Input
                    id="edit-last-name"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone</Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+244 923 456 789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Endereço</Label>
                <Textarea
                  id="edit-address"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveProfile} disabled={isSaving} className="flex-1">
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-6 pb-6 border-b">
              <Avatar className="w-24 h-24 bg-primary">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl mb-1 truncate">
                  {user.first_name} {user.last_name}
                </h3>
                <p className="text-muted-foreground truncate">{user.email}</p>
                {user.phone && <p className="text-sm text-muted-foreground mt-1 truncate">{user.phone}</p>}
                {user.address && <p className="text-sm text-muted-foreground mt-1 truncate">{user.address}</p>}
              </div>
              <Button variant="outline" size="icon" onClick={handleStartEdit} title="Editar perfil">
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          )}

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
