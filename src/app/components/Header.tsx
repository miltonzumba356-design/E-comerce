import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Menu, Search, User, Heart, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { ShoppingCartSheet } from './ShoppingCart';
import { useShop } from './ShopContext';
import { useAuth } from '../contexts/AuthContext';
import { useCatalog } from '../contexts/CatalogContext';
import { SearchDialog } from './SearchDialog';
import { ProfileDialog } from './ProfileDialog';
import { FavoritesDialog } from './FavoritesDialog';

export function Header() {
  const { favorites } = useShop();
  const { categories } = useCatalog();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);

  // Navegação gerada a partir das categorias reais cadastradas no backend
  const menuItems = [
    { name: 'Início', href: '#' },
    ...categories.map((category) => ({ name: category.name, href: `#${category.slug}` })),
  ];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#') && href !== '#') {
      e.preventDefault();
      const tabId = href.replace('#', '');
      const element = document.getElementById(tabId);
      if (element) {
        element.click();
        const colecaoElement = document.getElementById('colecao');
        if (colecaoElement) {
          colecaoElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setProfileOpen(true);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">I</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                INCLUSIVA
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-6">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleClick(e, item.href)}
                  className="text-gray-700 hover:text-black transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </nav>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex"
              onClick={() => setSearchOpen(true)}
            >
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
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex"
              onClick={handleProfileClick}
            >
              <User className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex relative"
              onClick={() => setFavoritesOpen(true)}
            >
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
              <SheetContent>
                <nav className="flex flex-col gap-4 mt-8">
                  {menuItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={(e) => handleClick(e, item.href)}
                      className="text-lg text-gray-700 hover:text-black transition-colors"
                    >
                      {item.name}
                    </a>
                  ))}

                  <div className="border-t pt-4 mt-4 space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setSearchOpen(true)}
                    >
                      <Search className="h-5 w-5 mr-2" />
                      Buscar
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleProfileClick}
                    >
                      <User className="h-5 w-5 mr-2" />
                      Meu Perfil
                    </Button>
                    {user?.role === 'admin' && (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => navigate('/admin')}
                      >
                        <LayoutDashboard className="h-5 w-5 mr-2" />
                        Painel Admin
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full justify-start relative"
                      onClick={() => setFavoritesOpen(true)}
                    >
                      <Heart className="h-5 w-5 mr-2" />
                      Favoritos
                      {favorites.length > 0 && (
                        <span className="ml-auto h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                          {favorites.length}
                        </span>
                      )}
                    </Button>
                    {isAuthenticated && (
                      <Button variant="outline" className="w-full justify-start" onClick={logout}>
                        <LogOut className="h-5 w-5 mr-2" />
                        Sair
                      </Button>
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
