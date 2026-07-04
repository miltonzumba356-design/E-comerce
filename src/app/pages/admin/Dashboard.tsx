import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { reportsAPI, ReportData } from '../../services/api';
import { Package, ShoppingCart, Users, Clock } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';

// O spec não documenta o corpo de /reports/dashboard/; os nomes de campo abaixo
// são um palpite razoável (total_revenue/total_orders/total_customers/pending_orders)
// e são lidos de forma defensiva — se o backend usar outros nomes, os cartões caem
// no valor padrão em vez de quebrar a tela.
export default function Dashboard() {
  const { format } = useCurrency();
  const [stats, setStats] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await reportsAPI.getDashboard();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
              {typeof totalOrders === 'number' ? totalOrders : 0}
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
              {typeof pendingOrders === 'number' ? pendingOrders : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Pedidos pendentes
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
