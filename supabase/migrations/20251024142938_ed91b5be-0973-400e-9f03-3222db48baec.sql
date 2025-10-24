-- Fix critical security vulnerabilities
-- Add explicit denial policies for anonymous access to sensitive tables

-- 1. Add explicit denial policy for profiles table (Critical: PII protection)
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false);

-- 2. Add explicit denial policy for orders table (Critical: Payment data protection)
CREATE POLICY "Deny anonymous access to orders"
ON public.orders
FOR ALL
TO anon
USING (false);

-- 3. Create 2FA verification codes table
CREATE TABLE public.verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verification codes"
ON public.verification_codes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert verification codes"
ON public.verification_codes
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update own verification codes"
ON public.verification_codes
FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Create site settings table for admin configuration
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  category text NOT NULL,
  label text NOT NULL,
  description text,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage site settings"
ON public.site_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default site settings
INSERT INTO public.site_settings (key, value, category, label, description) VALUES
('site_name', '"Galaxy Store"', 'general', 'Nome do Site', 'Nome exibido no site'),
('site_description', '"Sua loja online completa"', 'general', 'Descrição do Site', 'Descrição meta do site'),
('enable_2fa', 'true', 'security', 'Ativar 2FA', 'Requer autenticação de dois fatores para login'),
('require_auth_for_browsing', 'false', 'security', 'Requerer Login para Navegar', 'Usuários devem estar logados para navegar no site'),
('affiliate_auto_approve', 'false', 'affiliates', 'Aprovar Afiliados Automaticamente', 'Se desativado, afiliados precisam de aprovação manual'),
('min_order_value', '0', 'orders', 'Valor Mínimo do Pedido', 'Valor mínimo para realizar pedidos'),
('shipping_enabled', 'true', 'shipping', 'Frete Ativado', 'Ativar ou desativar cálculo de frete'),
('pix_enabled', 'true', 'payments', 'PIX Ativado', 'Aceitar pagamentos via PIX');

-- 5. Add trigger for updated_at on site_settings
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();