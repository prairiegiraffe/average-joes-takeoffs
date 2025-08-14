import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create a response that can be modified
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Get the pathname
    const pathname = request.nextUrl.pathname

    // Skip middleware for non-page routes
    if (
      pathname.includes('/_next') ||
      pathname.includes('/api') ||
      pathname.includes('.') // static files
    ) {
      return response
    }

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()

    // Define protected routes
    const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')
    
    // Define auth routes
    const isAuthRoute = pathname.startsWith('/auth')

    // Redirect logic
    if (!user && isProtectedRoute) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    if (user && isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
  } catch (error) {
    // If there's any error, just return the response
    console.error('Middleware error:', error)
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}