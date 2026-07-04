import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-100 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="mb-4">INCLUSIVA</h3>
            <p className="text-gray-600 text-sm">
              Moda que celebra a diversidade e promove a inclusão. Roupas para todos os corpos, todos os estilos.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4">Institucional</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-black">Sobre Nós</a></li>
              <li><a href="#" className="text-gray-600 hover:text-black">Nossas Lojas</a></li>
              <li><a href="#" className="text-gray-600 hover:text-black">Trabalhe Conosco</a></li>
              <li><a href="#" className="text-gray-600 hover:text-black">Sustentabilidade</a></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="mb-4">Ajuda</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-black">FAQ</a></li>
              <li><a href="#" className="text-gray-600 hover:text-black">Trocas e Devoluções</a></li>
              <li><a href="#" className="text-gray-600 hover:text-black">Entregas</a></li>
              <li><a href="#" className="text-gray-600 hover:text-black">Contato</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="mb-4">Redes Sociais</h4>
            <div className="flex gap-4">
              <a href="#" className="text-gray-600 hover:text-black">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-black">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-black">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-black">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
          <p>© 2025 Inclusiva. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-black">Política de Privacidade</a>
            <a href="#" className="hover:text-black">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
