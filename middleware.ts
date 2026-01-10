import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Retrieve the user role from cookies 
  const userRole = request.cookies.get('user_role')?.value;

  // DEBUGGING: These will show up in your terminal (not the browser console)
  console.log("🔒 Middleware checking path:", pathname);
  console.log("👤 User Role found:", userRole || "None");

  // 2. LOGIC: If trying to access ANY dashboard and NOT logged in
  if (pathname.startsWith('/dashboard') && !userRole) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // 3. LOGIC: Protect MSME Dashboard
  if (pathname.startsWith('/dashboard/msme') && userRole !== 'msme') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // 4. LOGIC: Protect Investor Dashboard
  if (pathname.startsWith('/dashboard/investor') && userRole !== 'investor') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // 5. LOGIC: Protect BigBuyer Dashboard
  if (pathname.startsWith('/dashboard/bigbuyer') && userRole !== 'bigbuyer') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

// Ensure this matches your folder name exactly
export const config = {
  matcher: ['/dashboard/:path*'],
};