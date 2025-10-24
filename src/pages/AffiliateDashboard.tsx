import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, DollarSign, TrendingUp, ShoppingBag, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AffiliateData {
  id: string;
  affiliate_code: string;
  commission_rate: number;
  total_sales: number;
  total_commission: number;
  status: string;
}

interface Sale {
  id: string;
  sale_amount: number;
  commission_amount: number;
  commission_rate: number;
  status: string;
  created_at: string;
}

export default function AffiliateDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/affiliate');
      } else {
        loadAffiliateData();
      }
    }
  }, [user, authLoading]);

  const loadAffiliateData = async () => {
    try {
      const { data: affiliateData, error: affiliateError } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (affiliateError) {
        if (affiliateError.code === 'PGRST116') {
          navigate('/affiliate');
          return;
        }
        throw affiliateError;
      }

      setAffiliate(affiliateData);

      const { data: salesData, error: salesError } = await supabase
        .from('affiliate_sales')
        .select('*')
        .eq('affiliate_id', affiliateData.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (salesError) throw salesError;

      setSales(salesData || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do afiliado',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyAffiliateCode = () => {
    if (affiliate) {
      navigator.clipboard.writeText(affiliate.affiliate_code);
      toast({
        title: 'Copiado!',
        description: 'Código de afiliado copiado para a área de transferência',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, label: 'Pendente' },
      active: { variant: 'default' as const, label: 'Ativo' },
      suspended: { variant: 'destructive' as const, label: 'Suspenso' },
    };
    const config = variants[status as keyof typeof variants] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSaleStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, label: 'Pendente' },
      approved: { variant: 'default' as const, label: 'Aprovado' },
      paid: { variant: 'outline' as const, label: 'Pago' },
    };
    const config = variants[status as keyof typeof variants] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!affiliate) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Painel do Afiliado</h1>
              <p className="text-muted-foreground">
                Acompanhe suas vendas e comissões
              </p>
            </div>
            {getStatusBadge(affiliate.status)}
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total em Vendas</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {Number(affiliate.total_sales).toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comissões Totais</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {Number(affiliate.total_commission).toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Comissão</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {affiliate.commission_rate}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vendas</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sales.length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Seu Código de Afiliado</CardTitle>
              <CardDescription>
                Compartilhe este código para rastrear suas vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input 
                  value={affiliate.affiliate_code} 
                  readOnly 
                  className="font-mono"
                />
                <Button onClick={copyAffiliateCode} variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Vendas</CardTitle>
              <CardDescription>
                Últimas vendas realizadas com seu código
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sales.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma venda realizada ainda
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor da Venda</TableHead>
                      <TableHead>Taxa</TableHead>
                      <TableHead>Comissão</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          {format(new Date(sale.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>R$ {Number(sale.sale_amount).toFixed(2)}</TableCell>
                        <TableCell>{sale.commission_rate}%</TableCell>
                        <TableCell className="font-semibold">
                          R$ {Number(sale.commission_amount).toFixed(2)}
                        </TableCell>
                        <TableCell>{getSaleStatusBadge(sale.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
