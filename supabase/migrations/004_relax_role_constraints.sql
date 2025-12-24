-- Relax role constraints to allow any text value
ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_role_check;

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Ensure role is still not null but defaults to 'Member' (capitalized for consistency)
ALTER TABLE invites ALTER COLUMN role SET DEFAULT 'Member';

ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'Member';