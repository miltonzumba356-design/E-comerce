import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Menu, Search, User, Heart, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { ShoppingCartSheet } from './ShoppingCart';
import { useShop } from './ShopContext';
import { useAuth } from '../contexts/AuthContext';
import { useCatalog } from '../contexts/CatalogContext';
import { SearchDialog } from './SearchDialog';
import { ProfileDialog } from './ProfileDialog';
import { FavoritesDialog } from './FavoritesDialog';
import { Logo } from './Logo';

interface HeaderProps {
  // Altura (em px) da barra utilitária acima do header, para não sobrepor o conteúdo.
  topOffset?: number;
}

export function Header({ topOffset = 0 }: HeaderProps) {
  const { favorites } = useShop();
  const { categories } = useCatalog();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);

  // Navegação com Início + as duas primeiras categorias cadastradas no backend
  const menuItems = [
    { name: 'Início', to: '/' },
    ...categories.slice(0, 2).map((category) => ({ name: category.name, to: `/?category=${category.slug}` })),
  ];

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setProfileOpen(true);
  };

  return (
    <header
      className="fixed inset-x-0 z-50 w-full border-b bg-background shadow-sm"
      style={{ top: topOffset }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/">
              <Logo nameClassName="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-6">
              {menuItems.map((item) => (
                <Link key={item.name} to={item.to} className="text-gray-700 hover:text-black transition-colors">
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="hidden sm:flex" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
            {user?.role === 'admin' && (
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex"
                onClick={() => navigate('/admin')}
                title="Painel Admin"
              >
                <LayoutDashboard className="h-5 w-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="hidden sm:flex" onClick={handleProfileClick}>
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:flex relative" onClick={() => setFavoritesOpen(true)}>
              <Heart className="h-5 w-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Button>
            <ShoppingCartSheet />

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="flex flex-col gap-0 p-0">
                <SheetHeader className="border-b">
                  <SheetTitle>
                    <Logo size={32} nameClassName="text-lg font-bold" />
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4">
                  <p className="px-3 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Navegação
                  </p>
                  <div className="space-y-1 mb-6">
                    {menuItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.to}
                        className="flex items-center rounded-xl px-3 py-2.5 text-foreground hover:bg-accent transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  <p className="px-3 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Conta
                  </p>
                  <div className="space-y-1">
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-accent transition-colors"
                      onClick={() => setSearchOpen(true)}
                    >
                      <Search className="h-5 w-5 text-muted-foreground" />
                      Buscar
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-accent transition-colors"
                      onClick={handleProfileClick}
                    >
                      <User className="h-5 w-5 text-muted-foreground" />
                      Meu Perfil
                    </button>
                    {user?.role === 'admin' && (
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-accent transition-colors"
                        onClick={() => navigate('/admin')}
                      >
                        <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                        Painel Admin
                      </button>
                    )}
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-accent transition-colors"
                      onClick={() => setFavoritesOpen(true)}
                    >
                      <Heart className="h-5 w-5 text-muted-foreground" />
                      Favoritos
                      {favorites.length > 0 && (
                        <span className="ml-auto h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {favorites.length}
                        </span>
                      )}
                    </button>
                    {isAuthenticated && (
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={logout}
                      >
                        <LogOut className="h-5 w-5" />
                        Sair
                      </button>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      {isAuthenticated && <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />}
      <FavoritesDialog open={favoritesOpen} onOpenChange={setFavoritesOpen} />
    </header>
  );
}
