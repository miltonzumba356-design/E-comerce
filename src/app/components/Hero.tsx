import { Button } from './ui/button';

export function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Altura do header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative h-[600px] bg-gray-100 overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1530028877439-c742c97d1543?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGRpdmVyc2UlMjBwZW9wbGUlMjBmYXNoaW9uJTIwc2hvcHBpbmd8ZW58MXx8fHwxNzYyNDQ4MTEwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      <div className="container mx-auto px-4 h-full relative z-10">
        <div className="flex flex-col justify-center h-full max-w-2xl text-white">
          <h2 className="text-5xl md:text-6xl mb-6">
            Moda para Todos
          </h2>
          <p className="text-xl mb-8 text-gray-100">
            Descubra roupas que celebram a diversidade e expressam sua autenticidade. 
            Estilo sem limites, para todos os corpos, todos os gostos.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-100"
              onClick={() => scrollToSection('colecao')}
            >
              Explorar Coleção
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
