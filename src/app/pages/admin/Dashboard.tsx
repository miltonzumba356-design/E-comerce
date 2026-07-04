import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '../../components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from 'recharts';
import { reportsAPI, ordersAPI, Order, ReportData, OrderStatusEnum } from '../../services/api';
import { Package, ShoppingCart, Users, Clock } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';

const STATUS_LABELS: Record<OrderStatusEnum, string> = {
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

// O spec não documenta o corpo de /reports/dashboard/; os nomes de campo abaixo
// são um palpite razoável e são lidos de forma defensiva. Os gráficos, por outro
// lado, são calculados a partir de /orders/ (schema real e conhecido).
export default function Dashboard() {
  const { format } = useCurrency();
  const [stats, setStats] = useState<ReportData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportsAPI.getDashboard().catch(() => null),
      ordersAPI.getAll(1, 200).catch(() => null),
    ]).then(([dashboardStats, ordersPage]) => {
      setStats(dashboardStats);
      setOrders(ordersPage?.results ?? []);
      setIsLoading(false);
    });
  }, []);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const order of orders) {
      counts[order.status] = (counts[order.status] || 0) + 1;
    }
    return (Object.keys(STATUS_LABELS) as OrderStatusEnum[]).map((status) => ({
      status: STATUS_LABELS[status],
      count: counts[status] || 0,
    }));
  }, [orders]);

  const revenueData = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const order of orders) {
      const month = new Date(order.created_at).toLocaleDateString('pt-AO', {
        month: 'short',
        year: '2-digit',
      });
      totals[month] = (totals[month] || 0) + parseFloat(order.total || '0');
    }
    return Object.entries(totals).map(([month, revenue]) => ({ month, revenue }));
  }, [orders]);

  const revenue = stats?.total_revenue;
  const totalOrders = stats?.total_orders;
  const totalCustomers = stats?.total_customers;
  const pendingOrders = stats?.pending_orders;

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Total
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeof revenue === 'number' || typeof revenue === 'string' ? format(revenue) : format(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Vendas totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pedidos
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeof totalOrders === 'number' ? totalOrders : orders.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de pedidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeof totalCustomers === 'number' ? totalCustomers : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeof pendingOrders === 'number'
                ? pendingOrders
                : orders.filter((o) => o.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Pedidos pendentes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por Status</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">
                Sem pedidos ainda para exibir no gráfico.
              </p>
            ) : (
              <ChartContainer config={statusChartConfig} className="h-64 w-full">
                <BarChart data={statusData}>
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
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">
                Sem pedidos ainda para exibir no gráfico.
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
    </div>
  );
}
