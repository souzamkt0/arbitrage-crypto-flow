-- Fix DigitoPay RLS Policy Issue
-- This migration fixes the Row Level Security policy for digitopay_transactions table

-- Remove the problematic INSERT policy
DROP POLICY IF EXISTS "Users can create digitopay transactions" ON digitopay_transactions;

-- Create a simplified and more permissive INSERT policy
CREATE POLICY "Allow authenticated users to create digitopay transactions" 
ON digitopay_transactions 
FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

-- Verify the policy was created correctly
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'digitopay_transactions' 
AND cmd = 'INSERT';
