-- Fix RLS policy for push_subscriptions to allow organization-wide notifications

-- Allow authenticated users to view push subscriptions of other users in the same organization
CREATE POLICY "Users can view org subscriptions" ON push_subscriptions FOR
SELECT USING (
        organization_id IN (
            SELECT organization_id
            FROM profiles
            WHERE
                id = auth.uid ()
        )
    );