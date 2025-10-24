import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function Affiliate() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingAffiliate, setCheckingAffiliate] = useState(true);
  const [isAffiliate, setIsAffiliate] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      checkAffiliateStatus();
    } else if (!authLoading && !user) {
      setCheckingAffiliate(false);
    }
  }, [user, authLoading]);

  const checkAffiliateStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIsAffiliate(true);
        navigate('/affiliate-dashboard');
      }
    } catch (error) {
      console.error('Error checking affiliate status:', error);
    } finally {
      setCheckingAffiliate(false);
    }
  };

  const generateAffiliateCode = () => {
    return 'AFF' + Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleBecomeAffiliate = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const affiliateCode = generateAffiliateCode();

      const { error } = await supabase
        .from('affiliates')
        .insert({
          user_id: user.id,
          affiliate_code: affiliateCode,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Solicitação enviada!',
        description: 'Sua solicitação para se tornar afiliado foi enviada. Aguarde aprovação.',
      });

      navigate('/affiliate-dashboard');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || checkingAffiliate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Programa de Afiliados</h1>
            <p className="text-lg text-muted-foreground">
              Ganhe comissões promovendo nossos produtos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Comissões Altas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ganhe até 10% de comissão em todas as vendas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Suporte Dedicado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Conte com nossa equipe para ajudar no sucesso
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Pagamentos Rápidos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Receba suas comissões mensalmente
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Torne-se um Afiliado</CardTitle>
              <CardDescription>
                Preencha o formulário abaixo para começar a ganhar comissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Como funciona?</h3>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Cadastre-se no programa de afiliados</li>
                      <li>Receba seu código de afiliado único</li>
                      <li>Compartilhe produtos com seu código</li>
                      <li>Ganhe comissões em cada venda realizada</li>
                    </ol>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  {!user ? (
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Você precisa estar logado para se tornar um afiliado
                      </p>
                      <Button onClick={() => navigate('/auth')} className="w-full">
                        Fazer Login / Cadastrar
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleBecomeAffiliate} 
                      disabled={loading}
                      className="w-full"
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Solicitar Cadastro como Afiliado
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
