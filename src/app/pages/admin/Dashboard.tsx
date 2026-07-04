import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '../../components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from 'recharts';
import {
  reportsAPI,
  DashboardStats,
  OrderStatusCount,
  MonthlyRevenue,
  BestSeller,
} from '../../services/api';
import { Package, ShoppingCart, Users, Clock, PackageX, Trophy } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const statusChartConfig: ChartConfig = {
  count: { label: 'Pedidos', color: '#c96442' },
};

const revenueChartConfig: ChartConfig = {
  revenue: { label: 'Receita (Kz)', color: '#c96442' },
};

export default function Dashboard() {
  const { format } = useCurrency();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statusData, setStatusData] = useState<OrderStatusCount[]>([]);
  const [revenueData, setRevenueData] = useState<MonthlyRevenue[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportsAPI.getDashboard().catch(() => null),
      reportsAPI.getOrdersByStatus().catch(() => null),
      reportsAPI.getMonthlyRevenue(6).catch(() => null),
      reportsAPI.getBestSellers(5).catch(() => null),
    ]).then(([dashboardStats, ordersByStatus, monthlyRevenue, topProducts]) => {
      setStats(dashboardStats);
      setStatusData(ordersByStatus?.results ?? []);
      setRevenueData(monthlyRevenue?.results ?? []);
      setBestSellers(topProducts?.results ?? []);
      setIsLoading(false);
    });
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
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral do seu e-commerce
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{format(stats?.total_revenue ?? 0)}</div>
            <p className="text-xs text-muted-foreground">Vendas totais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_orders ?? 0}</div>
            <p className="text-xs text-muted-foreground">Total de pedidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_customers ?? 0}</div>
            <p className="text-xs text-muted-foreground">Clientes cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_products ?? 0}</div>
            <p className="text-xs text-muted-foreground">Produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending_orders ?? 0}</div>
            <p className="text-xs text-muted-foreground">Pedidos pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <PackageX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.low_stock_items ?? 0}</div>
            <p className="text-xs text-muted-foreground">Itens com estoque baixo</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">
                Sem pedidos ainda para exibir no gráfico.
              </p>
            ) : (
              <ChartContainer config={statusChartConfig} className="h-64 w-full">
                <BarChart data={statusData.map((s) => ({ status: STATUS_LABELS[s.status] || s.status, count: s.count }))}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="status" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receita por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">
                Sem dados de receita ainda.
              </p>
            ) : (
              <ChartContainer config={revenueChartConfig} className="h-64 w-full">
                <LineChart data={revenueData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--color-revenue)' }}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Produtos Mais Vendidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bestSellers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Sem vendas registradas ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {bestSellers.map((item, index) => (
                <div
                  key={item.product__id}
                  className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">{item.total_sold} vendidos</p>
                    </div>
                  </div>
                  <p className="font-semibold">{format(item.total_revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
