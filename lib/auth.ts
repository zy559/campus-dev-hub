import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.error("[authorize] missing credentials, got keys:", credentials ? Object.keys(credentials) : "null");
          return null;
        }

        // 手动提取字段 — NextAuth 在 credentials 里塞了 csrfToken 等额外字段，Zod v4 .safeParse() 可能因此失败
        const username = String(credentials.username);
        const password = String(credentials.password);

        if (username.length < 2 || username.length > 20) {
          console.error("[authorize] username length invalid:", username.length);
          return null;
        }

        const user = await db.user.findUnique({
          where: { username },
        });

        if (!user) {
          console.error("[authorize] user not found:", username);
          return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return null;
        }

        // 检查是否被封禁
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
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.username = user.name ?? undefined;
        token.role = (user as { role?: string }).role ?? "user";
      }
      // 支持外部直接注入 token（模拟登录用）
      if (trigger === "update") {
        // token 已在调用时被覆盖，保持不变
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = (token.username || token.name) as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
