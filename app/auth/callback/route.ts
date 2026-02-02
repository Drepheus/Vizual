import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  // Determine origin for redirect
  let origin = requestUrl.origin;

  // Check headers for forwarded host (standard in Cloud Run / Vercel)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';

  if (forwardedHost) {
    origin = `${forwardedProto}://${forwardedHost}`;
  }

  if (code) {
    const cookieStorePromise = cookies()
    // @ts-ignore
    const cookieStore = typeof cookieStorePromise.then === 'function' ? await cookieStorePromise : cookieStorePromise

    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error: any) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}/auth/redirect`)
}
