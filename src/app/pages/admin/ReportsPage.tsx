import React, { useEffect, useState } from 'react';
import { reportsAPI, SalesReport, BestSeller } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '../../components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useCurrency } from '../../hooks/useCurrency';

const salesChartConfig: ChartConfig = {
  revenue: { label: 'Receita (Kz)', color: '#c96442' },
};

// GET /api/reports/ não documenta um schema de resposta ("Lista de endpoints") —
// renderização defensiva aceitando qualquer shape (array ou objeto).
function EndpointsList({ data }: { data: unknown }) {
  if (data === null || data === undefined) {
    return <p className="text-sm text-muted-foreground">Não foi possível carregar.</p>;
  }
  if (Array.isArray(data)) {
    return (
      <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
        {data.map((item, i) => (
          <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
        ))}
      </ul>
    );
  }
  if (typeof data === 'object') {
    return (
      <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
        {Object.entries(data as Record<string, unknown>).map(([key, value]) => (
          <li key={key}>
            <span className="font-medium text-foreground">{key}</span>: {String(value)}
          </li>
        ))}
      </ul>
    );
  }
  return <p className="text-sm text-muted-foreground">{String(data)}</p>;
}

export default function ReportsPage() {
  const { format } = useCurrency();
  const [days, setDays] = useState('30');
  const [salesLimit, setSalesLimit] = useState('25');
  const [sales, setSales] = useState<SalesReport[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [endpoints, setEndpoints] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    reportsAPI
      .list()
      .then(setEndpoints)
      .catch(() => setEndpoints(null));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    reportsAPI
      .getSales(Number(days))
      .then((data) => setSales(data.results))
      .catch(() => setSales([]))
      .finally(() => setIsLoading(false));
  }, [days]);

  useEffect(() => {
    reportsAPI
      .getBestSellers(Number(salesLimit))
      .then((data) => setBestSellers(data.results))
      .catch(() => setBestSellers([]));
  }, [salesLimit]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <p className="text-muted-foreground">Análises de vendas e desempenho da loja</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0">
          <CardTitle>Relatório de Vendas</CardTitle>
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : sales.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Sem vendas registradas neste período.
            </p>
          ) : (
            <>
              <ChartContainer config={salesChartConfig} className="h-64 w-full">
                <BarChart data={sales}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>

              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Pedidos</TableHead>
                      <TableHead>Receita</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((row) => (
                      <TableRow key={row.date}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.orders}</TableCell>
                        <TableCell>{format(row.revenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0">
          <CardTitle>Mais Vendidos</CardTitle>
          <Select value={salesLimit} onValueChange={setSalesLimit}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">Top 10</SelectItem>
              <SelectItem value="25">Top 25</SelectItem>
              <SelectItem value="50">Top 50</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {bestSellers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Sem vendas registradas ainda.
            </p>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Unidades Vendidas</TableHead>
                    <TableHead>Receita</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bestSellers.map((item) => (
                    <TableRow key={item.product__id}>
                      <TableCell className="font-medium">{item.product_name}</TableCell>
                      <TableCell>{item.total_sold}</TableCell>
                      <TableCell>{format(item.total_revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endpoints de Relatórios Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <EndpointsList data={endpoints} />
        </CardContent>
      </Card>
    </div>
  );
}
