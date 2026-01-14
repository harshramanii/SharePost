-- Function to transfer subscription from one user to another
-- This function bypasses RLS to allow subscription transfer during restore purchases
CREATE OR REPLACE FUNCTION transfer_subscription(
  p_transaction_id TEXT,
  p_new_user_id UUID,
  p_product_id TEXT,
  p_platform TEXT,
  p_subscription_type TEXT,
  p_status TEXT,
  p_purchase_date TIMESTAMP WITH TIME ZONE,
  p_expiry_date TIMESTAMP WITH TIME ZONE,
  p_original_transaction_id TEXT,
  p_receipt_data TEXT,
  p_auto_renew_enabled BOOLEAN
)
RETURNS JSON AS $$
DECLARE
  v_old_user_id UUID;
  v_result JSON;
BEGIN
  -- Find the old user_id for this transaction
  SELECT user_id INTO v_old_user_id
  FROM public.user_subscriptions
  WHERE transaction_id = p_transaction_id
  LIMIT 1;

  -- If subscription exists for a different user, delete it
  IF v_old_user_id IS NOT NULL AND v_old_user_id != p_new_user_id THEN
    -- Delete all subscriptions for the old user with this product_id
    DELETE FROM public.user_subscriptions
    WHERE user_id = v_old_user_id
      AND product_id = p_product_id;

    -- Insert/update subscription for the new user
    INSERT INTO public.user_subscriptions (
      user_id,
      product_id,
      transaction_id,
      platform,
      subscription_type,
      status,
      purchase_date,
      expiry_date,
      original_transaction_id,
      receipt_data,
      auto_renew_enabled,
      updated_at
    ) VALUES (
      p_new_user_id,
      p_product_id,
      p_transaction_id,
      p_platform,
      p_subscription_type,
      p_status,
      p_purchase_date,
      p_expiry_date,
      p_original_transaction_id,
      p_receipt_data,
      p_auto_renew_enabled,
      NOW()
    )
    ON CONFLICT (user_id, product_id)
    DO UPDATE SET
      transaction_id = EXCLUDED.transaction_id,
      status = EXCLUDED.status,
      purchase_date = EXCLUDED.purchase_date,
      expiry_date = EXCLUDED.expiry_date,
      original_transaction_id = EXCLUDED.original_transaction_id,
      receipt_data = EXCLUDED.receipt_data,
      auto_renew_enabled = EXCLUDED.auto_renew_enabled,
      updated_at = NOW();

    v_result := json_build_object(
      'success', true,
      'transferred', true,
      'old_user_id', v_old_user_id,
      'new_user_id', p_new_user_id
    );
  ELSE
    -- Subscription doesn't exist or already belongs to this user
    -- Just upsert it
    INSERT INTO public.user_subscriptions (
      user_id,
      product_id,
      transaction_id,
      platform,
      subscription_type,
      status,
      purchase_date,
      expiry_date,
      original_transaction_id,
      receipt_data,
      auto_renew_enabled,
      updated_at
    ) VALUES (
      p_new_user_id,
      p_product_id,
      p_transaction_id,
      p_platform,
      p_subscription_type,
      p_status,
      p_purchase_date,
      p_expiry_date,
      p_original_transaction_id,
      p_receipt_data,
      p_auto_renew_enabled,
      NOW()
    )
    ON CONFLICT (user_id, product_id)
    DO UPDATE SET
      transaction_id = EXCLUDED.transaction_id,
      status = EXCLUDED.status,
      purchase_date = EXCLUDED.purchase_date,
      expiry_date = EXCLUDED.expiry_date,
      original_transaction_id = EXCLUDED.original_transaction_id,
      receipt_data = EXCLUDED.receipt_data,
      auto_renew_enabled = EXCLUDED.auto_renew_enabled,
      updated_at = NOW();

    v_result := json_build_object(
      'success', true,
      'transferred', false
    );
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION transfer_subscription TO authenticated;
