import { createMiddlewareClient } from "@/lib/supabaseServer";
import { NextResponse, type NextRequest } from "next/server";
import { ENV } from "@/config/env";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const { client: supabase } = createMiddlewareClient(request, (newResponse) => {
    response = newResponse;
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protect dashboard and admin routes
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  const isAuthRoute = pathname.startsWith("/auth");
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  const pathParts = pathname.split("/").filter(Boolean);
  if (user && (pathParts[0] === "dashboard" || pathParts[0] === "admin")) {
    const userRole = user.user_metadata?.role || "MEMBER";

    // Enforce role restrictions on manual route hits
    if (userRole === "ADMIN" && pathParts[0] === "dashboard") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }

    if (userRole !== "ADMIN" && pathParts[0] === "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
