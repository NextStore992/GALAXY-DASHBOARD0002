-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create product_comparisons table
CREATE TABLE IF NOT EXISTS public.product_comparisons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Add foreign key from orders to profiles
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id);

-- Update existing orders to link to profiles
UPDATE public.orders o
SET profile_id = p.id
FROM public.profiles p
WHERE o.user_id = p.user_id AND o.profile_id IS NULL;

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_comparisons ENABLE ROW LEVEL SECURITY;

-- RLS policies for order_items
CREATE POLICY "Users can view own order items"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all order items"
ON public.order_items FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert order items"
ON public.order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- RLS policies for product_comparisons
CREATE POLICY "Users can view own comparisons"
ON public.product_comparisons FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own comparisons"
ON public.product_comparisons FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comparisons"
ON public.product_comparisons FOR DELETE
USING (auth.uid() = user_id);