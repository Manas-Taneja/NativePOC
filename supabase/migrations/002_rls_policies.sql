-- Enable Row Level Security on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view their own organization" ON organizations FOR
SELECT USING (
        id IN (
            SELECT organization_id
            FROM profiles
            WHERE
                id = auth.uid ()
        )
    );

CREATE POLICY "Organization owners can update their organization" ON organizations FOR
UPDATE USING (
    id IN (
        SELECT organization_id
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role = 'owner'
    )
);

CREATE POLICY "Authenticated users can create organizations" ON organizations FOR
INSERT
WITH
    CHECK (
        auth.role () = 'authenticated'
    );

-- Profiles policies
CREATE POLICY "Users can view profiles in their organization" ON profiles FOR
SELECT USING (
        organization_id IN (
            SELECT organization_id
            FROM profiles
            WHERE
                id = auth.uid ()
        )
    );

CREATE POLICY "Users can update their own profile" ON profiles FOR
UPDATE USING (id = auth.uid ());

-- Invites policies
CREATE POLICY "Users can view invites for their organization" ON invites FOR
SELECT USING (
        organization_id IN (
            SELECT organization_id
            FROM profiles
            WHERE
                id = auth.uid ()
        )
    );

CREATE POLICY "Admins and owners can create invites" ON invites FOR
INSERT
WITH
    CHECK (
        organization_id IN (
            SELECT organization_id
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role IN ('owner', 'admin')
        )
    );

-- Channels policies
CREATE POLICY "Users can view channels in their organization" ON channels FOR
SELECT USING (
        organization_id IN (
            SELECT organization_id
            FROM profiles
            WHERE
                id = auth.uid ()
        )
    );

CREATE POLICY "Admins and owners can create channels" ON channels FOR
INSERT
WITH
    CHECK (
        organization_id IN (
            SELECT organization_id
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role IN ('owner', 'admin')
        )
    );

-- Messages policies
CREATE POLICY "Users can view messages in their organization's channels" ON messages FOR
SELECT USING (
        channel_id IN (
            SELECT id
            FROM channels
            WHERE
                organization_id IN (
                    SELECT organization_id
                    FROM profiles
                    WHERE
                        id = auth.uid ()
                )
        )
    );

CREATE POLICY "Users can insert messages in their organization's channels" ON messages FOR
INSERT
WITH
    CHECK (
        channel_id IN (
            SELECT id
            FROM channels
            WHERE
                organization_id IN (
                    SELECT organization_id
                    FROM profiles
                    WHERE
                        id = auth.uid ()
                )
        )
    );

-- Insights policies (commented out due to missing table)
-- CREATE POLICY "Users can view insights in their organization" ON insights FOR
-- SELECT USING (
--         organization_id IN (
--             SELECT organization_id
--             FROM profiles
--             WHERE
--                 id = auth.uid ()
--         )
--     );

-- CREATE POLICY "Users can create insights in their organization" ON insights FOR
-- INSERT
-- WITH
--     CHECK (
--         organization_id IN (
--             SELECT organization_id
--             FROM profiles
--             WHERE
--                 id = auth.uid ()
--         )
--     );

-- CREATE POLICY "Users can update insights in their organization" ON insights FOR
-- UPDATE USING (
--     organization_id IN (
--         SELECT organization_id
--         FROM profiles
--         WHERE
--             id = auth.uid ()
--     )
-- );

-- Tasks policies (commented out due to missing table)
-- CREATE POLICY "Users can view tasks in their organization" ON tasks FOR
-- SELECT USING (
--         organization_id IN (
--             SELECT organization_id
--             FROM profiles
--             WHERE
--                 id = auth.uid ()
--         )
--     );

-- CREATE POLICY "Users can create tasks in their organization" ON tasks FOR
-- INSERT
-- WITH
--     CHECK (
--         organization_id IN (
--             SELECT organization_id
--             FROM profiles
--             WHERE
--                 id = auth.uid ()
--         )
--     );

-- CREATE POLICY "Users can update tasks in their organization" ON tasks FOR
-- UPDATE USING (
--     organization_id IN (
--         SELECT organization_id
--         FROM profiles
--         WHERE
--             id = auth.uid ()
--     )
-- );

-- CREATE POLICY "Only owners and admins can delete tasks" ON tasks FOR DELETE USING (
--     organization_id IN (
--         SELECT organization_id
--         FROM profiles
--         WHERE
--             id = auth.uid ()
--             AND role IN ('owner', 'admin')
--     )
-- );

-- Approvals policies (commented out due to missing table)
-- CREATE POLICY "Users can view approvals in their organization" ON approvals FOR
-- SELECT USING (
--         organization_id IN (
--             SELECT organization_id
--             FROM profiles
--             WHERE
--                 id = auth.uid ()
--         )
--     );

-- CREATE POLICY "Users can create approvals in their organization" ON approvals FOR
-- INSERT
-- WITH
--     CHECK (
--         organization_id IN (
--             SELECT organization_id
--             FROM profiles
--             WHERE
--                 id = auth.uid ()
--         )
--     );

-- CREATE POLICY "Owners and admins can update approvals" ON approvals FOR
-- UPDATE USING (
--     organization_id IN (
--         SELECT organization_id
--         FROM profiles
--         WHERE
--             id = auth.uid ()
--             AND role IN ('owner', 'admin')
--     )
-- );