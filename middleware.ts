import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes that don't need authentication
  const publicRoutes = ["/", "/register", "/success", "/login"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/api/registrations")
  );

  // Allow API routes for authentication
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (!req.auth && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!req.auth && pathname.startsWith("/registrations")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!req.auth && pathname.startsWith("/validation")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!req.auth && pathname.startsWith("/users")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!req.auth && pathname.startsWith("/settings")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
