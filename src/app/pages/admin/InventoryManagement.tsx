import React, { useEffect, useState } from 'react';
import { inventoryAPI, Stock } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';
import { AlertTriangle, Check } from 'lucide-react';

const isLowStock = (stock: Stock): boolean => {
  const value: unknown = stock.is_low_stock;
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true';
};

export default function InventoryManagement() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editValues, setEditValues] = useState<Record<number, string>>({});
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    setIsLoading(true);
    try {
      const data = await inventoryAPI.getAll();
      setStocks(data.results);
    } catch (error) {
      toast.error('Erro ao carregar inventário');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdjust = async (id: number) => {
    const value = editValues[id];
    if (value === undefined || value === '') return;

    try {
      await inventoryAPI.adjust(id, parseInt(value, 10));
      toast.success('Estoque atualizado com sucesso!');
      setEditValues((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      loadStocks();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao ajustar estoque');
    }
  };

  const visibleStocks = showLowStockOnly ? stocks.filter(isLowStock) : stocks;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventário</h2>
          <p className="text-muted-foreground">Controle o estoque dos produtos</p>
        </div>
        <Button
          variant={showLowStockOnly ? 'default' : 'outline'}
          onClick={() => setShowLowStockOnly((v) => !v)}
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          {showLowStockOnly ? 'Mostrando estoque baixo' : 'Mostrar apenas estoque baixo'}
        </Button>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Reservado</TableHead>
              <TableHead>Disponível</TableHead>
              <TableHead>Limite Mínimo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ajustar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleStocks.map((stock) => (
              <TableRow key={stock.id}>
                <TableCell className="font-medium">{stock.product_detail?.name}</TableCell>
                <TableCell>{stock.quantity}</TableCell>
                <TableCell>{stock.reserved}</TableCell>
                <TableCell>{stock.available}</TableCell>
                <TableCell>{stock.low_stock_threshold}</TableCell>
                <TableCell>
                  {isLowStock(stock) ? (
                    <Badge className="bg-red-100 text-red-700">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Estoque baixo
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-700">
                      <Check className="h-3 w-3 mr-1" />
                      OK
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Input
                      type="number"
                      min={0}
                      placeholder={String(stock.quantity)}
                      value={editValues[stock.id] ?? ''}
                      onChange={(e) =>
                        setEditValues((prev) => ({ ...prev, [stock.id]: e.target.value }))
                      }
                      className="w-24"
                    />
                    <Button size="sm" onClick={() => handleAdjust(stock.id)}>
                      Salvar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {visibleStocks.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Nenhum item de estoque encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
