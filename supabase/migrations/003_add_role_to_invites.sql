-- Add role column to invites table
ALTER TABLE invites
ADD COLUMN role TEXT NOT NULL DEFAULT 'member' CHECK (
    role IN ('owner', 'admin', 'member')
);