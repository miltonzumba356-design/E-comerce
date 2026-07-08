import { Star } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { useCurrency } from '../hooks/useCurrency';
import type { Category, SkinTypeEnum } from '../services/api';

export type PromotionFilter = 'new_arrival' | 'best_seller' | 'on_sale';
export type AvailabilityFilter = 'in_stock' | 'out_of_stock';

export const SKIN_TYPE_OPTIONS: { value: SkinTypeEnum; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'oily', label: 'Oleosa' },
  { value: 'dry', label: 'Seca' },
  { value: 'combination', label: 'Mista' },
  { value: 'sensitive', label: 'Sensível' },
];

export const PROMOTION_OPTIONS: { value: PromotionFilter; label: string }[] = [
  { value: 'new_arrival', label: 'Novidades' },
  { value: 'best_seller', label: 'Mais Vendidos' },
  { value: 'on_sale', label: 'Em Promoção' },
];

export const AVAILABILITY_OPTIONS: { value: AvailabilityFilter; label: string }[] = [
  { value: 'in_stock', label: 'Em Estoque' },
  { value: 'out_of_stock', label: 'Fora de Estoque' },
];

export interface ShopFiltersState {
  categories: string[];
  skinTypes: SkinTypeEnum[];
  priceRange: [number, number];
  ratings: number[];
  promotions: PromotionFilter[];
  availability: AvailabilityFilter[];
}

interface ShopFiltersProps {
  allCategories: Category[];
  priceBounds: [number, number];
  filters: ShopFiltersState;
  onToggleCategory: (slug: string) => void;
  onToggleSkinType: (value: SkinTypeEnum) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onToggleRating: (rating: number) => void;
  onTogglePromotion: (value: PromotionFilter) => void;
  onToggleAvailability: (value: AvailabilityFilter) => void;
  onClearAll: () => void;
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0">
      <h3 className="font-medium mb-3">{title}</h3>
      {children}
    </div>
  );
}

export function ShopFilters({
  allCategories,
  priceBounds,
  filters,
  onToggleCategory,
  onToggleSkinType,
  onPriceRangeChange,
  onToggleRating,
  onTogglePromotion,
  onToggleAvailability,
  onClearAll,
}: ShopFiltersProps) {
  const { format } = useCurrency();

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Filtros</h2>
        <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={onClearAll}>
          Limpar tudo
        </Button>
      </div>

      <FilterGroup title="Por Categoria">
        <div className="space-y-2">
          {allCategories.map((category) => (
            <Label key={category.slug} className="flex items-center gap-2 font-normal cursor-pointer">
              <Checkbox
                checked={filters.categories.includes(category.slug)}
                onCheckedChange={() => onToggleCategory(category.slug)}
              />
              {category.name}
            </Label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Por Tipo de Pele">
        <div className="space-y-2">
          {SKIN_TYPE_OPTIONS.map((option) => (
            <Label key={option.value} className="flex items-center gap-2 font-normal cursor-pointer">
              <Checkbox
                checked={filters.skinTypes.includes(option.value)}
                onCheckedChange={() => onToggleSkinType(option.value)}
              />
              {option.label}
            </Label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Preço">
        <Slider
          min={priceBounds[0]}
          max={priceBounds[1]}
          step={1}
          value={filters.priceRange}
          onValueChange={(value) => onPriceRangeChange([value[0], value[1]])}
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-3">
          <span>{format(filters.priceRange[0])}</span>
          <span>{format(filters.priceRange[1])}</span>
        </div>
      </FilterGroup>

      <FilterGroup title="Avaliação">
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => (
            <Label key={stars} className="flex items-center gap-2 font-normal cursor-pointer">
              <Checkbox checked={filters.ratings.includes(stars)} onCheckedChange={() => onToggleRating(stars)} />
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < stars ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                  />
                ))}
              </span>
            </Label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Por Promoção">
        <div className="space-y-2">
          {PROMOTION_OPTIONS.map((option) => (
            <Label key={option.value} className="flex items-center gap-2 font-normal cursor-pointer">
              <Checkbox
                checked={filters.promotions.includes(option.value)}
                onCheckedChange={() => onTogglePromotion(option.value)}
              />
              {option.label}
            </Label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Disponibilidade">
        <div className="space-y-2">
          {AVAILABILITY_OPTIONS.map((option) => (
            <Label key={option.value} className="flex items-center gap-2 font-normal cursor-pointer">
              <Checkbox
                checked={filters.availability.includes(option.value)}
                onCheckedChange={() => onToggleAvailability(option.value)}
              />
              {option.label}
            </Label>
          ))}
        </div>
      </FilterGroup>
    </aside>
  );
}
