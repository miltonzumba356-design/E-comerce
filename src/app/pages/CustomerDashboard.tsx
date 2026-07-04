import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI, Order, OrderStatusEnum } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Package, ShoppingBag, User } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrency } from '../hooks/useCurrency';
import { Header } from '../components/Header';

const STATUS_COLORS: Record<OrderStatusEnum, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<OrderStatusEnum, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { format } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await ordersAPI.getAll();
      setOrders(data.results);
    } catch (error) {
      toast.error('Erro ao carregar pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: OrderStatusEnum) => (
    <Badge className={STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'}>
      {STATUS_LABELS[status] || status}
    </Badge>
  );

  return (
    <div className="min-h-screen">
      <Header />
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Minha Conta</h1>
            <p className="text-muted-foreground">Bem-vindo de volta, {user?.first_name}!</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">
                    {user?.first_name} {user?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                {user?.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Resumo de Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de Pedidos</span>
                  <span className="font-bold">{orders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pedidos Pendentes</span>
                  <span className="font-bold">
                    {orders.filter((o) => o.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pedidos Entregues</span>
                  <span className="font-bold">
                    {orders.filter((o) => o.status === 'delivered').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Meus Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Você ainda não fez nenhum pedido</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsDialogOpen(true);
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-3 mb-2">
                          <p className="font-medium">Pedido #{order.id}</p>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('pt-AO', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-lg font-bold">{format(order.total)}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Detalhes do Pedido #{selectedOrder?.id}</DialogTitle>
              </DialogHeader>
              {selectedOrder && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Data do Pedido</p>
                      <p className="mt-1">
                        {new Date(selectedOrder.created_at).toLocaleDateString('pt-AO', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Endereço de Entrega</p>
                      <p className="mt-1">{selectedOrder.shipping_address}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Produtos</h4>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between border-b pb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{item.product_name}</p>
                              <p className="text-sm text-muted-foreground">
                                Quantidade: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <p className="font-medium">{format(item.subtotal)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{format(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
