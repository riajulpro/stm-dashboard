import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

/* ----------------------------- */
/* Session */
/* ----------------------------- */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: string;
  }
}

/* ----------------------------- */
/* JWT Token */
/* ----------------------------- */
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: string;
  }
}
