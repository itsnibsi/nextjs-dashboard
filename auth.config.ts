import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      if (isOnDashboard) {
        // false redirects to login page
        return isLoggedIn;
      }

      // What are you doing outside?
      return isLoggedIn ? Response.redirect(new URL('/dashboard', nextUrl)) : true;
    }
  },
  providers: [], // auth providers array
} satisfies NextAuthConfig;