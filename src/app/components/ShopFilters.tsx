import { useState } from 'react';
import { SlidersHorizontal, Star } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
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
  activeCount: number;
  onToggleCategory: (slug: string) => void;
  onToggleSkinType: (value: SkinTypeEnum) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onToggleRating: (rating: number) => void;
  onTogglePromotion: (value: PromotionFilter) => void;
  onToggleAvailability: (value: AvailabilityFilter) => void;
  onClearAll: () => void;
}

type ShopFiltersContentProps = Omit<ShopFiltersProps, 'activeCount' | 'onClearAll'>;

function ShopFiltersContent({
  allCategories,
  priceBounds,
  filters,
  onToggleCategory,
  onToggleSkinType,
  onPriceRangeChange,
  onToggleRating,
  onTogglePromotion,
  onToggleAvailability,
}: ShopFiltersContentProps) {
  const { format } = useCurrency();

  return (
    <Accordion type="multiple" className="w-full">
      <AccordionItem value="category">
        <AccordionTrigger>Por Categoria</AccordionTrigger>
        <AccordionContent>
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
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="skin-type">
        <AccordionTrigger>Por Tipo de Pele</AccordionTrigger>
        <AccordionContent>
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
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="price">
        <AccordionTrigger>Preço</AccordionTrigger>
        <AccordionContent>
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
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="rating">
        <AccordionTrigger>Avaliação</AccordionTrigger>
        <AccordionContent>
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
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="promotion">
        <AccordionTrigger>Por Promoção</AccordionTrigger>
        <AccordionContent>
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
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="availability">
        <AccordionTrigger>Disponibilidade</AccordionTrigger>
        <AccordionContent>
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
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function ShopFilters({ activeCount, onClearAll, ...contentProps }: ShopFiltersProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 shrink-0">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <Badge variant="secondary" className="h-5 min-w-5 justify-center px-1 rounded-full">
              {activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-sm p-0 flex flex-col gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>Filtros</SheetTitle>
        </SheetHeader>

        <div className="flex items-center justify-end px-4 pt-3">
          <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={onClearAll}>
            Limpar tudo
          </Button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
          <ShopFiltersContent {...contentProps} />
        </div>

        <SheetFooter className="border-t">
          <SheetClose asChild>
            <Button className="w-full">Ver Resultados</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
