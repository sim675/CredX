import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Retrieve the user role from cookies 
  const userRole = request.cookies.get('user_role')?.value;

  // DEBUGGING: These will show up in your terminal
  console.log("🔒 Middleware checking path:", pathname);
  console.log("👤 User Role found:", userRole || "None");

  // 2. LOGIC: If trying to access dashboard and NOT logged in at all
  // (Assuming you have a 'logged_in' or 'wallet_connected' cookie, otherwise use userRole)
  if (pathname.startsWith('/dashboard') && !userRole) {
    // Check if they are already on an onboarding path to prevent redirect loops
    if (pathname.includes('/onboarding') || pathname.includes('/register')) {
      return NextResponse.next();
    }
    // If they have no role and aren't onboarding, send them to sign in
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // 3. THE FIX: Protect Specific Dashboards ONLY if the role is mismatching
  // But allow them if they are in the middle of picking a role
  
  // Protect MSME Dashboard
  if (pathname.startsWith('/dashboard/msme') && userRole !== 'msme') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Protect Investor Dashboard
  if (pathname.startsWith('/dashboard/investor') && userRole !== 'investor') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Protect BigBuyer Dashboard
  if (pathname.startsWith('/dashboard/bigbuyer') && userRole !== 'bigbuyer') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // We added /unauthorized to the matcher to ensure the middleware handles it if needed
  matcher: ['/dashboard/:path*', '/unauthorized'],
};