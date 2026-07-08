import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { FeatureStrip } from '../components/FeatureStrip';
import { ProductGrid } from '../components/ProductGrid';
import {
  ShopFilters,
  SKIN_TYPE_OPTIONS,
  PROMOTION_OPTIONS,
  AVAILABILITY_OPTIONS,
  type ShopFiltersState,
  type PromotionFilter,
  type AvailabilityFilter,
} from '../components/ShopFilters';
import { ShopToolbar, type SortOption, type ActiveFilterChip } from '../components/ShopToolbar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/breadcrumb';
import { Button } from '../components/ui/button';
import { useCatalog } from '../contexts/CatalogContext';
import { useCurrency } from '../hooks/useCurrency';
import type { SkinTypeEnum } from '../services/api';

const TOP_BAR_HEIGHT = 36;
const PAGE_SIZE = 12;

function toggleInArray<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | 'ellipsis')[] = [1];
  if (current > 3) pages.push('ellipsis');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
  if (current < total - 2) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

export default function HomePage() {
  const { categories, products, isLoading } = useCatalog();
  const { format } = useCurrency();
  const [searchParams, setSearchParams] = useSearchParams();

  const [priceBounds, setPriceBounds] = useState<[number, number]>([0, 0]);
  const [priceBoundsInitialized, setPriceBoundsInitialized] = useState(false);

  const [filters, setFilters] = useState<ShopFiltersState>({
    categories: [],
    skinTypes: [],
    priceRange: [0, 0],
    ratings: [],
    promotions: [],
    availability: [],
  });
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [page, setPage] = useState(1);

  // Define os limites de preço a partir do catálogo real, uma única vez após o carregamento.
  useEffect(() => {
    if (!priceBoundsInitialized && products.length > 0) {
      const prices = products.map((p) => parseFloat(p.price));
      const min = Math.floor(Math.min(...prices));
      const max = Math.ceil(Math.max(...prices));
      setPriceBounds([min, max]);
      setFilters((prev) => ({ ...prev, priceRange: [min, max] }));
      setPriceBoundsInitialized(true);
    }
  }, [products, priceBoundsInitialized]);

  // Deep-link de categoria vindo do Header (/?category=slug)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setFilters((prev) => ({ ...prev, categories: [categoryParam] }));
      setPage(1);
      const next = new URLSearchParams(searchParams);
      next.delete('category');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const toggleCategory = (slug: string) => {
    setFilters((prev) => ({ ...prev, categories: toggleInArray(prev.categories, slug) }));
    setPage(1);
  };
  const toggleSkinType = (value: SkinTypeEnum) => {
    setFilters((prev) => ({ ...prev, skinTypes: toggleInArray(prev.skinTypes, value) }));
    setPage(1);
  };
  const setPriceRange = (range: [number, number]) => {
    setFilters((prev) => ({ ...prev, priceRange: range }));
    setPage(1);
  };
  const toggleRating = (rating: number) => {
    setFilters((prev) => ({ ...prev, ratings: toggleInArray(prev.ratings, rating) }));
    setPage(1);
  };
  const togglePromotion = (value: PromotionFilter) => {
    setFilters((prev) => ({ ...prev, promotions: toggleInArray(prev.promotions, value) }));
    setPage(1);
  };
  const toggleAvailability = (value: AvailabilityFilter) => {
    setFilters((prev) => ({ ...prev, availability: toggleInArray(prev.availability, value) }));
    setPage(1);
  };
  const clearAll = () => {
    setFilters({
      categories: [],
      skinTypes: [],
      priceRange: priceBounds,
      ratings: [],
      promotions: [],
      availability: [],
    });
    setPage(1);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (filters.categories.length && !filters.categories.includes(product.category)) return false;
      if (filters.skinTypes.length && !(product.skin_type && filters.skinTypes.includes(product.skin_type))) return false;

      const price = parseFloat(product.price);
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;

      if (filters.ratings.length) {
        const minRating = Math.min(...filters.ratings);
        if (!(typeof product.rating === 'number' && product.rating >= minRating)) return false;
      }

      if (filters.promotions.length) {
        const matches = filters.promotions.some((promo) => {
          if (promo === 'best_seller') return !!product.is_best_seller;
          if (promo === 'new_arrival') return !!product.is_new_arrival;
          if (promo === 'on_sale') return !!product.original_price && parseFloat(product.original_price) > price;
          return false;
        });
        if (!matches) return false;
      }

      if (filters.availability.length) {
        const wantIn = filters.availability.includes('in_stock');
        const wantOut = filters.availability.includes('out_of_stock');
        const isInStock = product.in_stock !== false;
        if (wantIn && !wantOut && !isInStock) return false;
        if (wantOut && !wantIn && isInStock) return false;
      }

      return true;
    });
  }, [products, filters]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-desc':
        list.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'rating':
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }
    return list;
  }, [filteredProducts, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageProducts = sortedProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = sortedProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, sortedProducts.length);

  const activeChips: ActiveFilterChip[] = [
    ...filters.categories.map((slug) => {
      const category = categories.find((c) => c.slug === slug);
      return { key: `cat-${slug}`, label: category?.name ?? slug, onRemove: () => toggleCategory(slug) };
    }),
    ...filters.skinTypes.map((value) => ({
      key: `skin-${value}`,
      label: SKIN_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value,
      onRemove: () => toggleSkinType(value),
    })),
    ...filters.ratings.map((rating) => ({
      key: `rating-${rating}`,
      label: `${rating}+ estrelas`,
      onRemove: () => toggleRating(rating),
    })),
    ...filters.promotions.map((value) => ({
      key: `promo-${value}`,
      label: PROMOTION_OPTIONS.find((o) => o.value === value)?.label ?? value,
      onRemove: () => togglePromotion(value),
    })),
    ...filters.availability.map((value) => ({
      key: `avail-${value}`,
      label: AVAILABILITY_OPTIONS.find((o) => o.value === value)?.label ?? value,
      onRemove: () => toggleAvailability(value),
    })),
  ];
  if (priceBoundsInitialized && (filters.priceRange[0] !== priceBounds[0] || filters.priceRange[1] !== priceBounds[1])) {
    activeChips.push({
      key: 'price',
      label: `${format(filters.priceRange[0])} - ${format(filters.priceRange[1])}`,
      onRemove: () => setPriceRange(priceBounds),
    });
  }

  return (
    <div className="min-h-screen">
      <TopBar />
      <Header topOffset={TOP_BAR_HEIGHT} />

      <main className="pt-24 sm:pt-28" style={{ marginTop: TOP_BAR_HEIGHT }}>
        {/* Banner da página */}
        <div className="bg-gray-50 py-10 border-b">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-2">Loja</h1>
            <Breadcrumb className="justify-center flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Início</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Loja</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              <ShopFilters
                allCategories={categories}
                priceBounds={priceBounds}
                filters={filters}
                onToggleCategory={toggleCategory}
                onToggleSkinType={toggleSkinType}
                onPriceRangeChange={setPriceRange}
                onToggleRating={toggleRating}
                onTogglePromotion={togglePromotion}
                onToggleAvailability={toggleAvailability}
                onClearAll={clearAll}
              />

              <div className="flex-1 min-w-0">
                <ShopToolbar
                  totalResults={sortedProducts.length}
                  rangeStart={rangeStart}
                  rangeEnd={rangeEnd}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  activeChips={activeChips}
                  onClearAll={clearAll}
                />

                <ProductGrid
                  products={pageProducts}
                  emptyMessage="Nenhum produto encontrado com os filtros selecionados."
                />

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 mt-10">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={currentPage === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {getPageNumbers(currentPage, totalPages).map((entry, index) =>
                      entry === 'ellipsis' ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                          …
                        </span>
                      ) : (
                        <Button
                          key={entry}
                          variant={entry === currentPage ? 'default' : 'ghost'}
                          size="icon"
                          onClick={() => setPage(entry)}
                        >
                          {entry}
                        </Button>
                      )
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={currentPage === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <FeatureStrip />
      </main>

      <Footer />
    </div>
  );
}
