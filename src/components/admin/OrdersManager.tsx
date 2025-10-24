import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Check, X, Clock, Package } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  pix_code: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles(full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar pedidos');
      console.error(error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Erro ao atualizar status do pagamento');
      console.error(error);
    } else {
      toast.success('Status do pagamento atualizado');
      fetchOrders();
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Erro ao atualizar status do pedido');
      console.error(error);
    } else {
      toast.success('Status do pedido atualizado');
      fetchOrders();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      pending: { variant: "outline", icon: Clock },
      processing: { variant: "default", icon: Package },
      completed: { variant: "default", icon: Check },
      cancelled: { variant: "destructive", icon: X },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {status === 'pending' && 'Pendente'}
        {status === 'processing' && 'Processando'}
        {status === 'completed' && 'Concluído'}
        {status === 'cancelled' && 'Cancelado'}
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    if (status === 'paid') {
      return <Badge variant="default">Pago</Badge>;
    }
    return <Badge variant="outline">Aguardando</Badge>;
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'unpaid') return order.payment_status === 'pending';
    if (filter === 'paid') return order.payment_status === 'paid';
    return order.status === filter;
  });

  if (loading) {
    return <div className="text-center py-8">Carregando pedidos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Pedidos</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="unpaid">Pagamento Pendente</SelectItem>
            <SelectItem value="paid">Pagos</SelectItem>
            <SelectItem value="pending">Pedidos Pendentes</SelectItem>
            <SelectItem value="processing">Em Processamento</SelectItem>
            <SelectItem value="completed">Concluídos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredOrders.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhum pedido encontrado</p>
        </Card>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status Pedido</TableHead>
                <TableHead>Status Pagamento</TableHead>
                <TableHead>Código PIX</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>{order.profiles?.full_name}</TableCell>
                  <TableCell>R$ {order.total_amount.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{getPaymentBadge(order.payment_status)}</TableCell>
                  <TableCell className="font-mono text-xs">{order.pix_code}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      {order.payment_status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => updatePaymentStatus(order.id, 'paid')}
                          className="w-full"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Confirmar Pagamento
                        </Button>
                      )}
                      {order.payment_status === 'paid' && order.status !== 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="w-full"
                        >
                          <Package className="w-4 h-4 mr-1" />
                          Marcar como Entregue
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
