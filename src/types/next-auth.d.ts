import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      collegeId: string | null;
      phone?: string | null;
    };
  }

  interface User {
    role?: string;
    collegeId?: string | null;
    phone?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    collegeId: string | null;
    name?: string;
    phone?: string | null;
  }
}
