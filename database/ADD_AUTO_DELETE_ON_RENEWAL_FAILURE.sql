-- Auto-delete accounts when subscription renewal fails
-- This migration adds functionality to automatically delete accounts when payments fail

-- Create function to automatically delete accounts when subscriptions expire without renewal
CREATE OR REPLACE FUNCTION auto_delete_expired_subscriptions()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expired_record RECORD;
  v_deletion_count INTEGER := 0;
  v_error_count INTEGER := 0;
  v_errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Find all subscriptions that have expired and not been renewed
  FOR v_expired_record IN
    SELECT 
      us.user_id,
      us.id as subscription_id,
      us.expires_at,
      sp.name as plan_name,
      p.email
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    LEFT JOIN profiles p ON us.user_id = p.id
    WHERE us.status = 'active'
    AND us.expires_at < NOW() - INTERVAL '1 day'  -- Grace period of 1 day
    AND us.auto_renew = true  -- Only auto-renew subscriptions that failed
  LOOP
    BEGIN
      -- Delete the expired account using existing function
      PERFORM handle_subscription_cancellation(
        v_expired_record.user_id,
        TRUE  -- Always delete account on renewal failure
      );
      
      v_deletion_count := v_deletion_count + 1;
      
      RAISE NOTICE 'Account % deleted due to renewal failure', v_expired_record.user_id;
      
    EXCEPTION
      WHEN OTHERS THEN
        v_error_count := v_error_count + 1;
        v_errors := array_append(v_errors, 
          format('User %s: %s', v_expired_record.user_id, SQLERRM)
        );
    END;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'deleted_accounts', v_deletion_count,
    'errors', v_error_count,
    'error_details', v_errors,
    'processed_at', NOW()
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Create function to check for failed renewals and handle them
CREATE OR REPLACE FUNCTION process_failed_renewals()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- This function is called by the daily-renewal-processing Edge Function
  -- It identifies and processes accounts that need to be deleted due to renewal failures
  
  SELECT auto_delete_expired_subscriptions() INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Create a table to track deletion events (for auditing)
CREATE TABLE IF NOT EXISTS account_deletions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    email TEXT,
    deletion_reason TEXT NOT NULL,
    plan_name TEXT,
    subscription_id UUID,
    deleted_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_by TEXT DEFAULT 'system'
);

-- Add RLS to account_deletions table
ALTER TABLE account_deletions ENABLE ROW LEVEL SECURITY;

-- Only admins can view deletion records
CREATE POLICY "Admin can view all deletion records"
ON account_deletions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Enhanced subscription cancellation function with deletion tracking
CREATE OR REPLACE FUNCTION handle_subscription_cancellation(
  p_user_id UUID,
  p_delete_account BOOLEAN DEFAULT FALSE,
  p_deletion_reason TEXT DEFAULT 'Manual cancellation'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_subscription_record RECORD;
  v_user_email TEXT;
  v_result JSON;
BEGIN
  -- Get current subscription and user info
  SELECT us.*, sp.name as plan_name, p.email
  INTO v_subscription_record
  FROM user_subscriptions us
  LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
  LEFT JOIN profiles p ON us.user_id = p.id
  WHERE us.user_id = p_user_id 
  AND us.status = 'active'
  LIMIT 1;

  -- Check if user has an active subscription
  IF v_subscription_record IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No active subscription found'
    );
  END IF;

  -- Cancel the subscription
  UPDATE user_subscriptions 
  SET 
    status = 'cancelled',
    cancelled_at = NOW(),
    auto_renew = FALSE,
    updated_at = NOW()
  WHERE id = v_subscription_record.id;

  -- If delete account is requested
  IF p_delete_account THEN
    -- Log the deletion before actually deleting
    INSERT INTO account_deletions (
      user_id,
      email,
      deletion_reason,
      plan_name,
      subscription_id
    ) VALUES (
      p_user_id,
      v_subscription_record.email,
      p_deletion_reason,
      v_subscription_record.plan_name,
      v_subscription_record.id
    );

    -- Delete all user data in correct order (respecting foreign key constraints)
    
    -- 1. Delete subscription records
    DELETE FROM user_subscriptions WHERE user_id = p_user_id;
    
    -- 2. Delete user posts and related data
    DELETE FROM post_likes WHERE user_id = p_user_id;
    DELETE FROM post_comments WHERE user_id = p_user_id;
    DELETE FROM posts WHERE user_id = p_user_id;
    
    -- 3. Delete user content and progress
    DELETE FROM user_courses WHERE user_id = p_user_id;
    DELETE FROM user_progress WHERE user_id = p_user_id;
    DELETE FROM user_certificates WHERE user_id = p_user_id;
    DELETE FROM user_bookmarks WHERE user_id = p_user_id;
    DELETE FROM user_preferences WHERE user_id = p_user_id;
    DELETE FROM user_notifications WHERE user_id = p_user_id;
    DELETE FROM emergency_contacts WHERE user_id = p_user_id;
    DELETE FROM preparedness_plans WHERE user_id = p_user_id;
    DELETE FROM saved_articles WHERE user_id = p_user_id;
    
    -- 4. Delete media items uploaded by user
    DELETE FROM media_items WHERE uploaded_by = p_user_id;
    
    -- 5. Delete profile last (has foreign key to auth.users)
    DELETE FROM profiles WHERE id = p_user_id;
    
    v_result := json_build_object(
      'success', true,
      'subscription_cancelled', true,
      'account_deleted', true,
      'deletion_reason', p_deletion_reason,
      'message', 'Subscription cancelled and account permanently deleted'
    );
  ELSE
    v_result := json_build_object(
      'success', true,
      'subscription_cancelled', true,
      'account_deleted', false,
      'message', 'Subscription cancelled successfully'
    );
  END IF;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION auto_delete_expired_subscriptions() TO service_role;
GRANT EXECUTE ON FUNCTION process_failed_renewals() TO service_role;
GRANT EXECUTE ON FUNCTION handle_subscription_cancellation(UUID, BOOLEAN, TEXT) TO service_role;

-- Comments for documentation
COMMENT ON FUNCTION auto_delete_expired_subscriptions() IS 
'Automatically deletes accounts when subscriptions expire without successful renewal';

COMMENT ON FUNCTION process_failed_renewals() IS 
'Main function called by daily-renewal-processing Edge Function to handle renewal failures';

COMMENT ON TABLE account_deletions IS 
'Audit trail of all account deletions including reason and metadata';