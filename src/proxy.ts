import { NextResponse } from "next/server";
import { auth } from "./lib/auth";

export default auth((req) => {
  if (!req?.auth?.user) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  return NextResponse.next();
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/dashboard/:path*"],
};
