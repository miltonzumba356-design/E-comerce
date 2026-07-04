import { useCatalog } from '../contexts/CatalogContext';
import { cn } from './ui/utils';

// Keyframes para a animação de flutuação
const animationStyle = `
  @keyframes float-up {
    0% { transform: translateY(0px); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
    50% { transform: translateY(-15px); box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3); }
    100% { transform: translateY(0px); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
  }
  .animate-float-up {
    animation: float-up 6s ease-in-out infinite;
  }
`;

const POSITIONS = [
  'absolute left-1/2 top-1/2 h-auto w-[220px] sm:w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-2xl z-20',
  'absolute left-[20%] top-[15%] h-auto w-32 sm:w-48 rounded-xl shadow-lg z-10',
  'absolute right-[22%] top-[10%] h-auto w-28 sm:w-44 rounded-xl shadow-lg z-10',
  'absolute right-[18%] bottom-[12%] h-auto w-36 sm:w-56 rounded-xl shadow-lg z-30',
  'absolute right-[3%] top-1/2 -translate-y-[60%] h-auto w-28 sm:w-48 rounded-xl shadow-lg z-10',
  'absolute left-[15%] bottom-[8%] h-auto w-32 sm:w-52 rounded-xl shadow-lg z-30',
  'absolute left-[2%] top-[25%] h-auto w-28 sm:w-44 rounded-xl shadow-lg z-10',
];

const DELAYS = ['0s', '-1.2s', '-2.5s', '-3.5s', '-4.8s', '-5.2s', '-6s'];

export function ProductShowcase() {
  const { products, categories } = useCatalog();

  // Só produtos com imagem real cadastrada — nada de placeholders inventados.
  const displayProducts = products.filter((p) => p.image).slice(0, 7);

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <>
      <style>{animationStyle}</style>
      <section className="relative w-full bg-background py-20 sm:py-32 overflow-hidden">
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Feito para quem gosta de <span className="text-primary">tudo num só lugar</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg text-muted-foreground">
            Do dia a dia às ocasiões especiais — nosso catálogo cresce com produtos reais,
            escolhidos e cadastrados para você.
          </p>
        </div>

        <div className="relative z-0 mt-20 h-[360px] sm:h-[480px] lg:h-[560px] flex items-center justify-center">
          <div className="relative h-full w-full max-w-5xl">
            {displayProducts.map((product, index) => (
              <img
                key={product.id}
                src={product.image!}
                alt={product.name}
                className={cn(POSITIONS[index], 'object-cover animate-float-up')}
                style={{ animationDelay: DELAYS[index] }}
              />
            ))}
          </div>
        </div>

        <div className="container relative z-10 mx-auto mt-12 px-4">
          <div className="flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-16">
            <div className="text-center">
              <p className="text-4xl font-bold tracking-tight text-primary">{products.length}+</p>
              <p className="mt-1 text-sm font-medium text-muted-foreground">Produtos no catálogo</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold tracking-tight text-primary">{categories.length}+</p>
              <p className="mt-1 text-sm font-medium text-muted-foreground">Categorias</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
