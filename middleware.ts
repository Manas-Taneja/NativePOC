import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { logger } from '@/lib/logger'

export async function middleware(request: NextRequest) {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // Supabase not configured - allow all requests to pass through
        // This prevents redirect loops during development before setup
        logger.warn('Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
        return NextResponse.next()
    }

    const { user, response } = await updateSession(request)
    const pathname = request.nextUrl.pathname

    const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup")
    const isDashboard = pathname.startsWith("/dashboard")
    const isRoot = pathname === "/"

    // Special case: allow signup with invite code even if logged in
    const hasInviteCode = request.nextUrl.searchParams.has("invite")

    if (isAuthPage) {
        if (user && !hasInviteCode) {
            // Logged in user trying to access auth pages (without invite) - redirect to dashboard
            return NextResponse.redirect(new URL("/dashboard", request.url))
        }
        // Not logged in, or has invite code - allow access
        return response
    }

    if (isDashboard) {
        if (!user) {
            // Not logged in trying to access dashboard - redirect to login
            return NextResponse.redirect(new URL("/login", request.url))
        }
    }

    if (isRoot) {
        if (user) {
            // Logged in user visiting landing page - redirect to dashboard
            return NextResponse.redirect(new URL("/dashboard", request.url))
        }
        // Guest visiting landing page - allow
    }

    return response


}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
