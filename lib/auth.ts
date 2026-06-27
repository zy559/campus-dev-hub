import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { getLocalPreviewUser } from "./localPreviewAuth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const username = String(credentials.username);
        const password = String(credentials.password);
        const localPreviewUser = getLocalPreviewUser({
          nodeEnv: process.env.NODE_ENV,
          username,
          password,
        });

        if (localPreviewUser) return localPreviewUser;

        if (username.length < 2 || username.length > 20) return null;

        let user;
        try {
          user = await db.user.findUnique({ where: { username } });
        } catch (error) {
          console.error("[authorize] database unavailable:", error);
          return null;
        }

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return null;

        if (user.bannedUntil) {
          const bannedUntil = new Date(user.bannedUntil);
          if (bannedUntil > new Date()) {
            const daysLeft = Math.ceil((bannedUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            throw new Error(`账号已被封禁，剩余 ${daysLeft} 天`);
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.name ?? undefined;
        token.role = (user as { role?: string }).role ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = (token.username || token.name) as string;
        session.user.role = token.role as string;
        session.user.email = (token.email as string | undefined) ?? session.user.email;
        session.user.impersonating = Boolean(token.impersonating);
        session.user.impersonatorId = token.impersonatorId as string | undefined;
        session.user.impersonatorName = token.impersonatorName as string | undefined;
        session.user.impersonatorRole = token.impersonatorRole as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
