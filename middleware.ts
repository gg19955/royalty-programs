import { NextResponse, type NextRequest } from "next/server";

/**
 * Root middleware. Runs in the Edge Runtime.
 *
 * Intentionally a pass-through. Earlier versions refreshed Supabase
 * sessions here, but @supabase/supabase-js 2.45.x pulls a transitive
 * dependency that references `__dirname` and crashes in the Edge
 * runtime ("ReferenceError: __dirname is not defined"). Session
 * refresh is handled by the SSR cookie helpers invoked in server
 * components, so dropping it from middleware is safe for now.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
