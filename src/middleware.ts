import { getCookieCache, getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const pathname = request.nextUrl.pathname;

  const authPages = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];

  if (sessionCookie) {
    if (pathname === "/" || authPages.includes(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } else {
    if (pathname !== "/" && !authPages.includes(pathname)) {
      return NextResponse.redirect(
        new URL("/login?next=" + encodeURIComponent(pathname), request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /_next/ (Next.js internals)
     * 2. /_proxy/ (proxies for third-party services)
     * 3. /_static (inside /public)
     * 4. /_vercel (Vercel internals)
     * 5. Static files (e.g. /favicon.ico, /sitemap.xml, /robots.txt, etc.)
     * 7. /api/ (API routes)
     * 8. /api-docs (API documentation)
     */
    "/((?!_next/|_proxy/|_static|_vercel|api-docs|api/|[\\w-]+\\.\\w+).*)",
  ],
};
