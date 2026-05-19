import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/platform")) {
    if (role !== "PLATFORM_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    if (role === "PLATFORM_ADMIN") {
      return NextResponse.redirect(new URL("/platform", req.url));
    }

    if (pathname.startsWith("/dashboard/licensee")) {
      if (role !== "LICENSEE") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    } else if (pathname.startsWith("/dashboard/admin")) {
      if (role !== "TENANT_ADMIN" && role !== "REVIEWER") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/platform/:path*"],
};
