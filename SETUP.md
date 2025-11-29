# NativePOC - Supabase Backend Setup

> [!IMPORTANT]
> **Development Mode**: The application can run without Supabase configured, but authentication and database features will not work. You'll see a warning in the console. To enable full functionality, complete the setup steps below.

## Prerequisites

1. **Supabase Project**: Create a new project at [supabase.com](https://supabase.com)
2. **Node.js**: Version 20 or higher
3. **npm**: Comes with Node.js

## Setup Instructions

### 1. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

**Where to find these values:**

**Supabase:**
- Go to your Supabase project dashboard
- Click on "Settings" → "API"
- Copy the "Project URL" and "anon public" key

**Gemini API:**
- Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
- Create a new API key
- Copy the key

### 3. Run Database Migrations

You have two options:

#### Option A: Using Supabase Dashboard (Recommended for first-time setup)

1. Go to your Supabase project dashboard
2. Click on "SQL Editor"
3. Create a new query
4. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
5. Run the query
6. Repeat for `supabase/migrations/002_rls_policies.sql`

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 4. Verify Database Setup

Check that the following tables were created:
- `organizations`
- `profiles`
- `organization_invites`
- `channels`
- `messages`
- `insights`
- `tasks`
- `approvals`

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## First-Time Usage

1. Navigate to `http://localhost:3000`
2. You'll be redirected to `/login`
3. Click "Sign up" to create a new account
4. Fill in:
   - Full Name
   - Organization Name (this creates your organization)
   - Email
   - Password (minimum 6 characters)
5. After signup, you'll be logged in and redirected to the dashboard
6. An AI assistant channel is automatically created for your organization

## Features

### Authentication
- Email/password signup and login
- Automatic organization creation on signup
- Session management with middleware
- Protected routes

### API Routes (All with Supabase)
- `GET /api/insights` - Fetch insights with filtering (type, impact, team)
- `GET /api/tasks` - Fetch tasks with filtering (assignee, state)
- `POST /api/tasks/from-thread` - Create task from Slack thread
- `POST /api/policy/check` - Role-based authorization check
- `POST /api/chat` - Google Gemini AI chat integration

### Authorization
- **Owner**: Full access, can delete tasks, update organization, invite members
- **Admin**: Can delete tasks, invite members
- **Member**: Can create/update tasks and insights

### Database Features
- Row Level Security (RLS) for data isolation
- Automatic profile creation on signup
- Organization-scoped data
- Real-time capabilities (ready for chat)

## Troubleshooting

### "Authentication required" errors
- Make sure you're logged in
- Check that `.env.local` has correct Supabase credentials
- Verify middleware is running (check `middleware.ts`)

### Database connection errors
- Verify Supabase project is active
- Check that migrations ran successfully
- Confirm environment variables are correct

### TypeScript errors
- The routing type errors in auth pages are cosmetic and don't affect functionality
- Run `npm run build` to check for actual build errors

## Next Steps

1. **Seed Data** (Optional): Create sample insights and tasks through the API
2. **Real-time Chat**: The infrastructure is ready, just need to connect the frontend
3. **Testing**: Test all API routes with authentication
4. **Deploy**: Deploy to Vercel or your preferred platform

## Project Structure

```
NativePOC/
├── app/
│   ├── (auth)/          # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── api/             # API routes (all enhanced with Supabase)
│   │   ├── chat/
│   │   ├── insights/
│   │   ├── tasks/
│   │   └── policy/
│   └── page.tsx         # Main dashboard
├── lib/
│   └── supabase/        # Supabase client configuration
│       ├── client.ts    # Browser client
│       ├── server.ts    # Server client
│       └── middleware.ts # Session management
├── hooks/
│   └── useAuth.ts       # Authentication hook
├── supabase/
│   └── migrations/      # Database migrations
└── middleware.ts        # Next.js middleware for auth
```

## Support

For issues or questions:
1. Check the implementation plan: `implementation_plan.md`
2. Review the backend comparison: `backend-comparison.md`
3. Check Supabase documentation: https://supabase.com/docs
