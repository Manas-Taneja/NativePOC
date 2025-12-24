DO $$ 
BEGIN
    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invites' AND column_name = 'role') THEN
        ALTER TABLE invites ADD COLUMN role TEXT NOT NULL DEFAULT 'Member';
    END IF;

    -- Drop constraints if they exist (to allow flexible roles)
    ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_role_check;
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

    -- Set default to Member (capitalized)
    ALTER TABLE invites ALTER COLUMN role SET DEFAULT 'Member';
    ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'Member';
END $$;