import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Affiliate {
  id: string;
  user_id: string;
  affiliate_code: string;
  commission_rate: number;
  total_sales: number;
  total_commission: number;
  status: string;
  created_at: string;
}

interface Profile {
  full_name: string | null;
  email: string | null;
}

interface AffiliateWithProfile extends Affiliate {
  profile: Profile | null;
}

export default function AffiliatesManager() {
  const [affiliates, setAffiliates] = useState<AffiliateWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    try {
      const { data: affiliatesData, error: affiliatesError } = await supabase
        .from('affiliates')
        .select('*')
        .order('created_at', { ascending: false });

      if (affiliatesError) throw affiliatesError;

      const affiliatesWithProfiles = await Promise.all(
        (affiliatesData || []).map(async (affiliate) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', affiliate.user_id)
            .maybeSingle();

          return {
            ...affiliate,
            profile: profileData
          };
        })
      );

      setAffiliates(affiliatesWithProfiles);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar afiliados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAffiliateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Status do afiliado atualizado',
      });

      fetchAffiliates();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Gerenciar Afiliados</h2>
        <p className="text-muted-foreground">
          Aprove, suspenda ou ative afiliados
        </p>
      </div>

      {affiliates.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Nenhum afiliado cadastrado ainda
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Taxa</TableHead>
                  <TableHead>Vendas</TableHead>
                  <TableHead>Comissões</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affiliates.map((affiliate) => (
                  <TableRow key={affiliate.id}>
                    <TableCell className="font-medium">
                      {affiliate.profile?.full_name || 'N/A'}
                    </TableCell>
                    <TableCell>{affiliate.profile?.email || 'N/A'}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {affiliate.affiliate_code}
                    </TableCell>
                    <TableCell>{affiliate.commission_rate}%</TableCell>
                    <TableCell>R$ {Number(affiliate.total_sales).toFixed(2)}</TableCell>
                    <TableCell>R$ {Number(affiliate.total_commission).toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(affiliate.status)}</TableCell>
                    <TableCell>
                      {format(new Date(affiliate.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {affiliate.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => updateAffiliateStatus(affiliate.id, 'active')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                        )}
                        {affiliate.status === 'active' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateAffiliateStatus(affiliate.id, 'suspended')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Suspender
                          </Button>
                        )}
                        {affiliate.status === 'suspended' && (
                          <Button
                            size="sm"
                            onClick={() => updateAffiliateStatus(affiliate.id, 'active')}
                          >
                            Ativar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
