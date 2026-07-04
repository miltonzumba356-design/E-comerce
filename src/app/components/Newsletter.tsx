import { Button } from './ui/button';
import { Input } from './ui/input';

export function Newsletter() {
  return (
    <section className="py-16 bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl mb-4">Fique por Dentro</h2>
          <p className="text-gray-300 mb-8">
            Receba novidades, ofertas exclusivas e lançamentos diretamente no seu e-mail
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Seu melhor e-mail"
              className="bg-white text-black border-0"
            />
            <Button className="bg-white text-black hover:bg-gray-100 whitespace-nowrap">
              Inscrever-se
            </Button>
          </div>
          
          <p className="text-sm text-gray-400 mt-4">
            Ao se inscrever, você concorda com nossa política de privacidade
          </p>
        </div>
      </div>
    </section>
  );
}
