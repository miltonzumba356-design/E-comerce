import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from './ui/carousel';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Product } from '../services/api';

interface PromoSlide {
  product: Product;
  label: string;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=60';
const AUTOPLAY_INTERVAL_MS = 4500;

function pickPromoSlides(products: Product[]): PromoSlide[] {
  const used = new Set<number>();
  const slides: PromoSlide[] = [];

  const onSale = products.find(
    (p) => !used.has(p.id) && p.original_price && parseFloat(p.original_price) > parseFloat(p.price)
  );
  if (onSale) {
    slides.push({ product: onSale, label: 'Em Promoção' });
    used.add(onSale.id);
  }

  const bestSeller = products.find((p) => !used.has(p.id) && p.is_best_seller);
  if (bestSeller) {
    slides.push({ product: bestSeller, label: 'Mais Vendido' });
    used.add(bestSeller.id);
  }

  const newArrival = products.find((p) => !used.has(p.id) && p.is_new_arrival);
  if (newArrival) {
    slides.push({ product: newArrival, label: 'Novidade' });
    used.add(newArrival.id);
  }

  // Catálogo sem produtos sinalizados (sem promoção/mais vendido/novidade): usa os
  // primeiros produtos disponíveis como destaque, pra sempre haver algo no banner.
  if (slides.length === 0) {
    for (const product of products) {
      if (slides.length >= 3) break;
      if (used.has(product.id)) continue;
      slides.push({ product, label: 'Em Destaque' });
      used.add(product.id);
    }
  }

  return slides.slice(0, 4);
}

interface PromoBannerProps {
  products: Product[];
}

export function PromoBanner({ products }: PromoBannerProps) {
  const slides = useMemo(() => pickPromoSlides(products), [products]);
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
    api.on('select', () => setSelectedIndex(api.selectedScrollSnap()));
  }, [api]);

  useEffect(() => {
    if (!api || slides.length <= 1) return;
    const id = setInterval(() => api.scrollNext(), AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [api, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="bg-secondary/40 border-b">
      <div className="container mx-auto px-4 py-8 sm:py-10">
        <Carousel opts={{ loop: slides.length > 1 }} setApi={setApi}>
          <CarouselContent>
            {slides.map(({ product, label }) => (
              <CarouselItem key={product.id}>
                <Link
                  to={`/produto/${product.slug}`}
                  className="relative block aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden bg-muted"
                >
                  <ImageWithFallback
                    src={product.image || FALLBACK_IMAGE}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <Badge className="bg-brand-accent text-white border-transparent mb-2">{label}</Badge>
                    <h2 className="text-white text-2xl sm:text-3xl font-bold line-clamp-2">{product.name}</h2>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {slides.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {slides.map((slide, index) => (
              <button
                key={slide.product.id}
                type="button"
                aria-label={`Ir para o destaque ${index + 1}`}
                onClick={() => api?.scrollTo(index)}
                className={`h-2 rounded-full transition-all ${
                  index === selectedIndex ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
