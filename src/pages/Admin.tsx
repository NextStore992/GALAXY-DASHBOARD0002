import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductsManager from '@/components/admin/ProductsManager';
import CategoriesManager from '@/components/admin/CategoriesManager';
import OrdersManager from '@/components/admin/OrdersManager';
import CouponsManager from '@/components/admin/CouponsManager';
import AffiliatesManager from '@/components/admin/AffiliatesManager';
import { Shield } from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          </div>
          <p className="text-muted-foreground">Gerencie todos os aspectos da sua loja</p>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="orders">Pedidos</TabsTrigger>
              <TabsTrigger value="products">Produtos</TabsTrigger>
              <TabsTrigger value="categories">Categorias</TabsTrigger>
              <TabsTrigger value="coupons">Cupons</TabsTrigger>
              <TabsTrigger value="affiliates">Afiliados</TabsTrigger>
            </TabsList>
            
            <TabsContent value="orders" className="mt-6">
              <OrdersManager />
            </TabsContent>
            
            <TabsContent value="products" className="mt-6">
              <ProductsManager />
            </TabsContent>
            
            <TabsContent value="categories" className="mt-6">
              <CategoriesManager />
            </TabsContent>
            
            <TabsContent value="coupons" className="mt-6">
              <CouponsManager />
            </TabsContent>

            <TabsContent value="affiliates" className="mt-6">
              <AffiliatesManager />
            </TabsContent>
          </Tabs>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
