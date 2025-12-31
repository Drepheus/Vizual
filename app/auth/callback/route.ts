import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // Force custom domain if we are in production (heuristic based on cloud run url)
  let origin = requestUrl.origin;
  
  // Check headers for forwarded host (standard in Cloud Run)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');

  if (forwardedHost && forwardedProto) {
    origin = `${forwardedProto}://${forwardedHost}`;
  }

  // HARD OVERRIDE: If we are on the cloud run URL, try to redirect to the custom domain
  // This fixes the issue where users get stuck on the .run.app domain
  /*
  if (origin.includes('run.app')) {
    origin = 'https://usevizualai.com';
  }
  */

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to auth-redirect page which will check sessionStorage for intended destination
  return NextResponse.redirect(`${origin}/auth/redirect`)
}
