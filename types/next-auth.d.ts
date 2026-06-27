import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      impersonating?: boolean;
      impersonatorId?: string;
      impersonatorName?: string;
      impersonatorRole?: string;
    };
  }

  interface User {
    id: string;
    username?: string;
    role?: string;
    impersonating?: boolean;
    impersonatorId?: string;
    impersonatorName?: string;
    impersonatorRole?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username?: string;
    role?: string;
  }
}
