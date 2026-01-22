import { auth } from "./lib/auth";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default auth((req) => {
  // req.auth
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
