import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";
import { sql } from '@vercel/postgres';
import type { User } from "@/app/lib/definitions";
import bcrypt from 'bcrypt';

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [Credentials({
    async authorize(creds) {
      // Validate user
      const parsedCreds = z
        .object({ email: z.string().email(), password: z.string().min(6) })
        .safeParse(creds);

      if (parsedCreds.success) {
        // Find user
        const { email, password } = parsedCreds.data;
        const user = await getUser(email);
        if (!user) return null;

        // Auth user
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (passwordsMatch) return user;
      }

      console.log(`Failed to authenticate user.`);
      return null;
    },
  })],
});