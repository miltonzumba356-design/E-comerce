import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Heart, ShoppingBag, Minus, Plus } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductGrid } from '../components/ProductGrid';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../components/ui/breadcrumb';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCatalog } from '../contexts/CatalogContext';
import { useShop } from '../components/ShopContext';
import { useCurrency } from '../hooks/useCurrency';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=60';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, isLoading } = useCatalog();
  const { addToCart, toggleFavorite, isFavorite } = useShop();
  const { format } = useCurrency();
  const [quantity, setQuantity] = useState(1);

  const product = products.find((p) => p.slug === slug);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-32 pb-16 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-32 pb-16 container mx-auto px-4 text-center">
          <p className="text-lg text-muted-foreground mb-4">Produto não encontrado.</p>
          <Button onClick={() => navigate('/')}>Voltar à loja</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const specs = [
    { label: 'Marca', value: product.brand },
    { label: 'Cor', value: product.color },
    { label: 'Material', value: product.material },
    { label: 'Peso', value: product.weight },
    { label: 'Dimensões', value: product.dimensions },
  ].filter((spec) => spec.value);

  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-28 sm:pt-32 pb-16">
        <div className="container mx-auto px-4">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Início</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {product.category_detail?.name && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/#${product.category_detail.slug}`}>{product.category_detail.name}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1">{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
              <ImageWithFallback
                src={product.image || FALLBACK_IMAGE}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-4">
              {product.category_detail?.name && (
                <Badge variant="outline" className="w-fit">
                  {product.category_detail.name}
                </Badge>
              )}

              <h1 className="text-2xl sm:text-3xl font-semibold">{product.name}</h1>
              <p className="text-2xl font-semibold">{format(product.price)}</p>

              {product.description && (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {product.description}
                </p>
              )}

              {specs.length > 0 && (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t pt-4">
                  {specs.map((spec) => (
                    <div key={spec.label}>
                      <dt className="text-muted-foreground">{spec.label}</dt>
                      <dd>{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm text-muted-foreground">Quantidade</span>
                <div className="flex items-center border rounded-full">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <Button className="flex-1" onClick={() => addToCart(product, quantity)}>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Adicionar ao Carrinho
                </Button>
                <Button variant="outline" size="icon" onClick={() => toggleFavorite(product.id)}>
                  <Heart className={`h-5 w-5 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-semibold mb-6">Você também pode gostar</h2>
              <ProductGrid products={relatedProducts} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
