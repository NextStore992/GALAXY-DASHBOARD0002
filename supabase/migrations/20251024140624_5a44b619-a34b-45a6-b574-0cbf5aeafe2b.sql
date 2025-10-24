-- Create affiliates table
CREATE TABLE public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  affiliate_code TEXT NOT NULL UNIQUE,
  commission_rate NUMERIC DEFAULT 10,
  total_sales NUMERIC DEFAULT 0,
  total_commission NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create affiliate_sales table to track sales
CREATE TABLE public.affiliate_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  sale_amount NUMERIC NOT NULL,
  commission_amount NUMERIC NOT NULL,
  commission_rate NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_sales ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliates
CREATE POLICY "Admins can view all affiliates"
  ON public.affiliates FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own affiliate profile"
  ON public.affiliates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own affiliate profile"
  ON public.affiliates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own affiliate profile"
  ON public.affiliates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any affiliate"
  ON public.affiliates FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for affiliate_sales
CREATE POLICY "Admins can view all sales"
  ON public.affiliate_sales FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Affiliates can view own sales"
  ON public.affiliate_sales FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.affiliates
      WHERE affiliates.id = affiliate_sales.affiliate_id
      AND affiliates.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert sales"
  ON public.affiliate_sales FOR INSERT
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_affiliates_code ON public.affiliates(affiliate_code);
CREATE INDEX idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX idx_affiliate_sales_affiliate_id ON public.affiliate_sales(affiliate_id);
CREATE INDEX idx_affiliate_sales_order_id ON public.affiliate_sales(order_id);