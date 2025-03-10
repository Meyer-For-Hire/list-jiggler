import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // Only intercept Slackbot requests to list pages
  if (userAgent.startsWith('Slackbot-LinkExpanding') && 
      request.nextUrl.pathname.startsWith('/list/')) {
    // Redirect to our oEmbed API endpoint
    const url = request.nextUrl.clone();
    url.pathname = '/api/oembed';
    url.searchParams.set('url', request.url);
    
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/list/:path*',
}; 