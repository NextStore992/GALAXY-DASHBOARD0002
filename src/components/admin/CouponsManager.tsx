import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_purchase_amount?: number;
  max_uses?: number;
  used_count: number;
  expires_at?: string;
  is_active: boolean;
}

export default function CouponsManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_purchase_amount: '',
    max_uses: '',
    expires_at: '',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar cupons');
      console.error(error);
    } else {
      setCoupons(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const couponData = {
      code: formData.code.toUpperCase(),
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      min_purchase_amount: formData.min_purchase_amount ? parseFloat(formData.min_purchase_amount) : null,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      expires_at: formData.expires_at || null,
      is_active: true,
    };

    if (editingCoupon) {
      const { error } = await supabase
        .from('coupons')
        .update(couponData)
        .eq('id', editingCoupon.id);

      if (error) {
        toast.error('Erro ao atualizar cupom');
        console.error(error);
      } else {
        toast.success('Cupom atualizado com sucesso');
        resetForm();
        fetchCoupons();
      }
    } else {
      const { error } = await supabase
        .from('coupons')
        .insert([{ ...couponData, used_count: 0 }]);

      if (error) {
        toast.error('Erro ao criar cupom');
        console.error(error);
      } else {
        toast.success('Cupom criado com sucesso');
        resetForm();
        fetchCoupons();
      }
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_purchase_amount: coupon.min_purchase_amount?.toString() || '',
      max_uses: coupon.max_uses?.toString() || '',
      expires_at: coupon.expires_at?.split('T')[0] || '',
    });
    setDialogOpen(true);
  };

  const toggleActive = async (coupon: Coupon) => {
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: !coupon.is_active })
      .eq('id', coupon.id);

    if (error) {
      toast.error('Erro ao atualizar cupom');
      console.error(error);
    } else {
      toast.success(`Cupom ${!coupon.is_active ? 'ativado' : 'desativado'}`);
      fetchCoupons();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cupom?')) return;

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir cupom');
      console.error(error);
    } else {
      toast.success('Cupom excluído com sucesso');
      fetchCoupons();
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      min_purchase_amount: '',
      max_uses: '',
      expires_at: '',
    });
    setEditingCoupon(null);
    setDialogOpen(false);
  };

  if (loading) {
    return <div className="text-center py-8">Carregando cupons...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Cupons</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cupom
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code">Código do Cupom</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="Ex: PROMO20"
                  required
                />
              </div>

              <div>
                <Label htmlFor="discount_type">Tipo de Desconto</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value) => setFormData({ ...formData, discount_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                    <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="discount_value">
                  Valor do Desconto {formData.discount_type === 'percentage' ? '(%)' : '(R$)'}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="min_purchase_amount">Valor Mínimo de Compra (R$) - Opcional</Label>
                <Input
                  id="min_purchase_amount"
                  type="number"
                  step="0.01"
                  value={formData.min_purchase_amount}
                  onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="max_uses">Número Máximo de Usos - Opcional</Label>
                <Input
                  id="max_uses"
                  type="number"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="expires_at">Data de Expiração - Opcional</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCoupon ? 'Atualizar' : 'Criar'} Cupom
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {coupons.map((coupon) => (
          <Card key={coupon.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <code className="text-xl font-bold">{coupon.code}</code>
                  <Badge variant={coupon.is_active ? "default" : "secondary"}>
                    {coupon.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    Desconto: {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `R$ ${coupon.discount_value.toFixed(2)}`}
                  </p>
                  {coupon.min_purchase_amount && (
                    <p>Compra mínima: R$ {coupon.min_purchase_amount.toFixed(2)}</p>
                  )}
                  {coupon.max_uses && (
                    <p>Usos: {coupon.used_count} / {coupon.max_uses}</p>
                  )}
                  {coupon.expires_at && (
                    <p>Expira em: {new Date(coupon.expires_at).toLocaleDateString('pt-BR')}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActive(coupon)}
                >
                  {coupon.is_active ? 'Desativar' : 'Ativar'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEdit(coupon)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(coupon.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
