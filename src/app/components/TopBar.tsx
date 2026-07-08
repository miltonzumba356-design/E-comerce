import { Link } from 'react-router';
import { Phone, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

interface TopBarProps {
  className?: string;
}

export function TopBar({ className = '' }: TopBarProps) {
  return (
    <div className={`fixed top-0 inset-x-0 z-40 h-9 bg-primary text-primary-foreground text-xs ${className}`}>
      <div className="container mx-auto h-full px-4 flex items-center justify-between gap-4">
        <a href="tel:+244923456789" className="hidden sm:flex items-center gap-1.5 hover:opacity-80">
          <Phone className="h-3.5 w-3.5" />
          <span>+244 923 456 789</span>
        </a>

        <Link to="/register" className="flex items-center gap-1 truncate hover:opacity-80">
          <span className="hidden sm:inline">Cadastre-se e ganhe 10% OFF na primeira compra —</span>
          <span className="underline underline-offset-2">Cadastrar</span>
        </Link>

        <div className="hidden sm:flex items-center gap-3">
          <a href="#" className="hover:opacity-80" aria-label="Facebook">
            <Facebook className="h-3.5 w-3.5" />
          </a>
          <a href="#" className="hover:opacity-80" aria-label="Twitter">
            <Twitter className="h-3.5 w-3.5" />
          </a>
          <a href="#" className="hover:opacity-80" aria-label="Instagram">
            <Instagram className="h-3.5 w-3.5" />
          </a>
          <a href="#" className="hover:opacity-80" aria-label="Youtube">
            <Youtube className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
