// auth.config.ts — Edge-safe config only (no Node.js APIs, no Prisma, no bcrypt).
// The credentials `authorize` function lives in auth.ts where Node APIs are available.
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],   // populated in auth.ts with the Credentials provider
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role?: string }).role;
        token.tenantId = (user as { tenantId?: string | null }).tenantId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as typeof session.user.role;
        session.user.tenantId = token.tenantId as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  trustHost: true,
} satisfies NextAuthConfig;
