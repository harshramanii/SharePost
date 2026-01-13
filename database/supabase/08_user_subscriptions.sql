-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  original_transaction_id TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (
    status IN ('active', 'expired', 'cancelled', 'trial', 'none')
  ),
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  receipt_data TEXT,
  auto_renew_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT user_subscriptions_user_product_unique UNIQUE (user_id, product_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id 
  ON public.user_subscriptions(user_id);

-- Create index on status and expiry_date for checking expired subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status_expiry 
  ON public.user_subscriptions(status, expiry_date);

-- Create index on transaction_id for lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_transaction_id 
  ON public.user_subscriptions(transaction_id);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own subscriptions
CREATE POLICY "Users can insert own subscriptions"
  ON public.user_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions"
  ON public.user_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_subscriptions_updated_at();
