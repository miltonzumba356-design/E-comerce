import { X } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default', label: 'Ordenação Padrão' },
  { value: 'price-asc', label: 'Menor Preço' },
  { value: 'price-desc', label: 'Maior Preço' },
  { value: 'rating', label: 'Melhor Avaliação' },
  { value: 'newest', label: 'Mais Recentes' },
];

export interface ActiveFilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface ShopToolbarProps {
  totalResults: number;
  rangeStart: number;
  rangeEnd: number;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  activeChips: ActiveFilterChip[];
  onClearAll: () => void;
}

export function ShopToolbar({
  totalResults,
  rangeStart,
  rangeEnd,
  sortBy,
  onSortChange,
  activeChips,
  onClearAll,
}: ShopToolbarProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {totalResults === 0
            ? 'Nenhum resultado encontrado'
            : `Mostrando ${rangeStart}-${rangeEnd} de ${totalResults} resultados`}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Ordenar por:</span>
          <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>
          {activeChips.map((chip) => (
            <Badge key={chip.key} variant="secondary" className="gap-1 pr-1.5">
              {chip.label}
              <button
                type="button"
                onClick={chip.onRemove}
                className="rounded-full hover:bg-black/10 p-0.5"
                aria-label={`Remover filtro ${chip.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={onClearAll}>
            Limpar Tudo
          </Button>
        </div>
      )}
    </div>
  );
}
