import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
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
import { Logo } from './Logo';

// Só a homepage tem uma hero escura por trás — nas demais páginas o header é sempre sólido.
const TRANSPARENT_ON_TOP_ROUTES = ['/'];
const SCROLL_THRESHOLD = 40;

export function Header() {
  const { favorites } = useShop();
  const { categories } = useCatalog();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const canBeTransparent = TRANSPARENT_ON_TOP_ROUTES.includes(location.pathname);
  const isTransparent = canBeTransparent && !isScrolled;

  useEffect(() => {
    if (!canBeTransparent) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [canBeTransparent]);

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

  const iconButtonClass = isTransparent ? 'text-white hover:bg-white/15 hover:text-white' : '';
  const navLinkClass = isTransparent
    ? 'text-white/90 hover:text-white transition-colors'
    : 'text-gray-700 hover:text-black transition-colors';

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 w-full transition-colors duration-300 ${
        isTransparent ? 'bg-transparent' : 'border-b bg-white shadow-sm'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/">
              <Logo
                nameClassName={
                  isTransparent
                    ? 'text-2xl font-bold text-white'
                    : 'text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'
                }
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-6">
              {menuItems.map((item) => (
                <a key={item.name} href={item.href} onClick={(e) => handleClick(e, item.href)} className={navLinkClass}>
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
              className={`hidden sm:flex ${iconButtonClass}`}
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            {user?.role === 'admin' && (
              <Button
                variant="ghost"
                size="icon"
                className={`hidden sm:flex ${iconButtonClass}`}
                onClick={() => navigate('/admin')}
                title="Painel Admin"
              >
                <LayoutDashboard className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={`hidden sm:flex ${iconButtonClass}`}
              onClick={handleProfileClick}
            >
              <User className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`hidden sm:flex relative ${iconButtonClass}`}
              onClick={() => setFavoritesOpen(true)}
            >
              <Heart className="h-5 w-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Button>
            <ShoppingCartSheet
              triggerClassName={isTransparent ? 'bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20' : ''}
            />

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className={iconButtonClass}>
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
