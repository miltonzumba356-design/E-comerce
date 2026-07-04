import React, { useEffect, useState } from 'react';
import { reportsAPI, ReportData } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';

// O spec (E-Commerce API.yaml) não documenta o corpo de resposta dos relatórios
// ("No response body"). Renderização defensiva: aceita qualquer shape (objeto,
// array de objetos, ou primitivo) sem assumir campos específicos.
type ReportValue = ReportData | ReportData[] | null;

function humanizeKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') return value.toLocaleString('pt-AO');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function ReportBody({ data }: { data: ReportValue }) {
  if (data === null) {
    return <p className="text-sm text-muted-foreground">Não foi possível carregar este relatório.</p>;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <p className="text-sm text-muted-foreground">Sem dados disponíveis.</p>;
    }
    const columns = Array.from(new Set(data.flatMap((row) => Object.keys(row))));
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col}>{humanizeKey(col)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((col) => (
                  <TableCell key={col}>{formatValue(row[col])}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  const entries = Object.entries(data);
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">Sem dados disponíveis.</p>;
  }

  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {entries.map(([key, value]) => (
        <div key={key} className="flex justify-between border-b pb-2">
          <dt className="text-muted-foreground">{humanizeKey(key)}</dt>
          <dd className="font-medium text-right">{formatValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

const REPORTS: { key: string; title: string; fetcher: () => Promise<ReportData> }[] = [
  { key: 'sales', title: 'Vendas', fetcher: reportsAPI.getSales },
  { key: 'best_sellers', title: 'Mais Vendidos', fetcher: reportsAPI.getBestSellers },
  { key: 'monthly_revenue', title: 'Receita Mensal', fetcher: reportsAPI.getMonthlyRevenue },
  { key: 'orders_by_status', title: 'Pedidos por Status', fetcher: reportsAPI.getOrdersByStatus },
];

export default function ReportsPage() {
  const [data, setData] = useState<Record<string, ReportValue>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const results = await Promise.all(
        REPORTS.map(async (report) => {
          try {
            const value = await report.fetcher();
            return [report.key, value as ReportValue] as const;
          } catch (error) {
            console.error(`Erro ao carregar relatório ${report.key}:`, error);
            return [report.key, null] as const;
          }
        })
      );
      setData(Object.fromEntries(results));
      setIsLoading(false);
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <p className="text-muted-foreground">Análises de vendas e desempenho da loja</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {REPORTS.map((report) => (
          <Card key={report.key}>
            <CardHeader>
              <CardTitle>{report.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportBody data={data[report.key] ?? null} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
